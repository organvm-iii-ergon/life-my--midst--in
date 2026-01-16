import { google, drive_v3 } from "googleapis";
import type {
  CloudStorageProvider,
  CloudCredentials,
  CloudFile,
  ListOptions,
  ProviderHealthStatus,
} from "./cloud-storage-provider";
import { Readable } from "stream";

export class GoogleDriveProvider implements CloudStorageProvider {
  readonly name = "google_drive" as const;
  private drive: drive_v3.Drive;
  private auth: any; // OAuth2Client

  constructor(credentials: CloudCredentials) {
    const clientId =
      credentials.clientId || process.env['GOOGLE_DRIVE_CLIENT_ID'];
    const clientSecret =
      credentials.clientSecret || process.env['GOOGLE_DRIVE_CLIENT_SECRET'];
    const redirectUri = process.env['GOOGLE_DRIVE_REDIRECT_URI'] || "http://localhost";

    if (!clientId || !clientSecret) {
      throw new Error(
        "Google Drive: Missing GOOGLE_DRIVE_CLIENT_ID or GOOGLE_DRIVE_CLIENT_SECRET"
      );
    }

    this.auth = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

    this.setCredentials(credentials);
    
    this.drive = google.drive({ version: "v3", auth: this.auth });
  }

  private setCredentials(credentials: CloudCredentials) {
    if (credentials.refreshToken) {
      this.auth.setCredentials({
        refresh_token: credentials.refreshToken,
        access_token: credentials.accessToken,
      });
    } else if (credentials.accessToken) {
       this.auth.setCredentials({
        access_token: credentials.accessToken,
      });
    }
  }

  async authenticate(credentials: CloudCredentials): Promise<void> {
    this.setCredentials(credentials);
    // Verify by making a lightweight call
    await this.checkHealth();
  }

  async *listFiles(
    folderPath: string,
    options?: ListOptions
  ): AsyncIterable<CloudFile> {
    // folderPath in Google Drive is typically a Folder ID. 
    // If it looks like a path (starts with /), we might need to resolve it, 
    // but standard practice here is to assume ID or handle root.
    const folderId = folderPath === "/" ? "root" : folderPath;

    const qParts = [`'${folderId}' in parents`, `trashed = false`];
    
    if (options?.filters?.maxFileSize) {
        // Drive API query doesn't easily support size < X in 'q' directly for all file types reliably 
        // without some nuances, but we can filter post-fetch or try 'size <= X'.
        // 'size' field is supported in q.
        qParts.push(`size <= ${options.filters.maxFileSize}`);
    }

    // MimeType filtering
    // options.filters.mimeTypes is array. q: (mimeType = 'x' or mimeType = 'y')
    if (options?.filters?.mimeTypes && options.filters.mimeTypes.length > 0) {
        const mimeQueries = options.filters.mimeTypes.map(t => `mimeType = '${t}'`);
        qParts.push(`(${mimeQueries.join(" or ")})`);
    }

    // Exclude patterns are hard to do in 'q' string (globbing). 
    // We must filter in application logic.

    const query = qParts.join(" and ");

    let pageToken: string | undefined = undefined;
    
    do {
      const res: any = await this.withRetry(() =>
        this.drive.files.list({
          q: query,
          fields: "nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, md5Checksum, webViewLink, parents)",
          pageSize: options?.pageSize || 100,
          pageToken: pageToken,
          includeItemsFromAllDrives: true,
          supportsAllDrives: true,
        })
      );

      const files = res.data.files;
      pageToken = res.data.nextPageToken;

      if (files) {
        for (const file of files) {
          if (!file.id || !file.name) continue;

          // Exclude patterns check
          if (options?.filters?.excludePatterns) {
             // Basic check: if filename matches any pattern. 
             // Real glob matching would require 'minimatch' or similar.
             // For now, assuming simple suffix/prefix or we can't fully implement glob without a library.
             // We'll skip complex globbing to avoid adding more deps unless necessary.
             // Let's assuming simple substring check for safety or just check if user wants strict glob.
             // Given constraint "already in dependencies", I can't add 'minimatch'.
             // I will implement simple wildcard matching if * is present, otherwise includes.
             const shouldExclude = options.filters.excludePatterns.some(pattern => {
                 if (pattern.startsWith("*") && pattern.endsWith("*")) return file.name?.includes(pattern.slice(1, -1));
                 if (pattern.startsWith("*")) return file.name?.endsWith(pattern.slice(1));
                 if (pattern.endsWith("*")) return file.name?.startsWith(pattern.slice(0, -1));
                 return file.name === pattern;
             });
             if (shouldExclude) continue;
          }

          const cloudFile: CloudFile = {
            fileId: file.id,
            name: file.name,
            path: file.id, // We don't have full path without traversing up
            mimeType: file.mimeType || "application/octet-stream",
            size: parseInt(file.size || "0"),
            createdTime: file.createdTime || new Date().toISOString(),
            modifiedTime: file.modifiedTime || new Date().toISOString(),
            checksum: file.md5Checksum || undefined,
            parentId: file.parents?.[0],
            webViewLink: file.webViewLink || undefined,
            isFolder: file.mimeType === "application/vnd.google-apps.folder",
          };

          yield cloudFile;

          // Recursion
          if (options?.recursive && cloudFile.isFolder) {
            yield* this.listFiles(file.id, options);
          }
        }
      }
    } while (pageToken);
  }

  async downloadFile(
    fileId: string,
    destinationPath: string,
    onProgress?: (bytesDownloaded: number) => void
  ): Promise<void> {
     // Use fs to write stream
     // However, I need to import fs. 
     // I'll dynamically import 'fs' to avoid top-level node deps if this runs in edge (though likely Node).
     // The file is in 'packages/core', typically Node env.
     const fs = await import("fs");

     const dest = fs.createWriteStream(destinationPath);

     const res = await this.withRetry(() => 
        this.drive.files.get(
            { fileId, alt: "media" },
            { responseType: "stream" }
        )
     );

     return new Promise((resolve, reject) => {
         const stream = res.data as Readable;
         let downloaded = 0;

         stream
            .on("data", (chunk) => {
                downloaded += chunk.length;
                if (onProgress) onProgress(downloaded);
            })
            .on("error", (err) => {
                dest.close();
                reject(err);
            })
            .pipe(dest)
            .on("finish", () => {
                resolve();
            })
            .on("error", (err: any) => {
                reject(err);
            });
     });
  }

  async getMetadata(fileId: string): Promise<CloudFile> {
    const res = await this.withRetry(() =>
      this.drive.files.get({
        fileId,
        fields: "id, name, mimeType, size, createdTime, modifiedTime, md5Checksum, webViewLink, parents",
        supportsAllDrives: true,
      })
    );

    const file = res.data;
    return {
        fileId: file.id!,
        name: file.name!,
        path: file.id!,
        mimeType: file.mimeType || "application/octet-stream",
        size: parseInt(file.size || "0"),
        createdTime: file.createdTime || new Date().toISOString(),
        modifiedTime: file.modifiedTime || new Date().toISOString(),
        checksum: file.md5Checksum || undefined,
        parentId: file.parents?.[0],
        webViewLink: file.webViewLink || undefined,
        isFolder: file.mimeType === "application/vnd.google-apps.folder",
    };
  }

  async checkHealth(): Promise<ProviderHealthStatus> {
    try {
      // Just fetch about info
      await this.withRetry(() => 
          this.drive.about.get({ fields: "user" })
      );
      
      let tokenExpiryStr: string | undefined;
      if (this.auth.credentials && this.auth.credentials.expiry_date) {
          tokenExpiryStr = new Date(this.auth.credentials.expiry_date).toISOString();
      }

      return {
        healthy: true,
        provider: "google_drive",
        lastChecked: new Date().toISOString(),
        tokenExpiry: tokenExpiryStr
      };
    } catch (err: any) {
      return {
        healthy: false,
        provider: "google_drive",
        message: err.message,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  private async withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
      let attempt = 0;
      while (true) {
          try {
              return await fn();
          } catch (err: any) {
              attempt++;
              if (attempt > retries) throw err;
              
              // Check for 429 or 5xx
              const status = err.response?.status || err.code;
              if (status === 429 || (status >= 500 && status < 600)) {
                  // Exponential backoff: 1s, 2s, 4s...
                  const delay = 1000 * Math.pow(2, attempt - 1);
                  await new Promise(r => setTimeout(r, delay));
                  continue;
              }
              throw err;
          }
      }
  }
}
