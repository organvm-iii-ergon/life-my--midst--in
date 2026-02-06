{{- define "inmidst.name" -}}
inmidst
{{- end }}

{{- define "inmidst.fullname" -}}
{{ include "inmidst.name" . }}
{{- end }}

{{- define "inmidst.apiName" -}}
{{ include "inmidst.name" . }}-api
{{- end }}

{{- define "inmidst.orchestratorName" -}}
{{ include "inmidst.name" . }}-orchestrator
{{- end }}

{{- define "inmidst.webName" -}}
{{ include "inmidst.name" . }}-web
{{- end }}

{{- define "inmidst.labels" -}}
app: {{ include "inmidst.name" . }}
app.kubernetes.io/name: {{ include "inmidst.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}
