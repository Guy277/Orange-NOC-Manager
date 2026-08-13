$ErrorActionPreference = "Stop"

function Call-Json($Method, $Url, $Body = $null) {
  $params = @{
    Method = $Method
    Uri = $Url
    Headers = @{ Accept = "application/json" }
  }

  if ($null -ne $Body) {
    $params.ContentType = "application/json"
    $params.Body = ($Body | ConvertTo-Json -Depth 10)
  }

  return Invoke-RestMethod @params
}

function Call-Web($Method, $Url) {
  return Invoke-WebRequest -Method $Method -Uri $Url -UseBasicParsing
}

function Assert-True($Condition, $Message) {
  if (-not $Condition) {
    throw $Message
  }
}

$base = "http://localhost:3000/api"

$report = [ordered]@{}

$report.health = Call-Json "GET" "$base/health"
Assert-True ($report.health.status -eq "ok") "Healthcheck API invalide."

$rootPage = Call-Web "GET" "http://localhost:3000/"
$dashboardPage = Call-Web "GET" "http://localhost:3000/dashboard"
$detailPage = Call-Web "GET" "http://localhost:3000/incidents/1"
Assert-True ($rootPage.StatusCode -eq 200) "La page racine ne repond pas."
Assert-True ($dashboardPage.StatusCode -eq 200) "Le fallback React /dashboard ne repond pas."
Assert-True ($detailPage.StatusCode -eq 200) "Le fallback React /incidents/1 ne repond pas."

$site = Call-Json "POST" "$base/sites" @{
  code = "PHASE4-SITE"
  name = "Site Phase 4"
  city = "Abidjan"
  region = "Lagunes"
  siteType = "radio"
}

$type = Call-Json "POST" "$base/incident-types" @{
  label = "Phase4 Radio Incident"
  description = "Type de demonstration phase 4"
  requiredSpecialty = "radio"
}

$technician = Call-Json "POST" "$base/technicians" @{
  name = "Technicien Phase 4"
  email = "technicien.phase4@demo.orange-noc.local"
  employeeCode = "TECH-PH4"
  specialty = "radio"
  zone = "Abidjan"
  isActive = $true
}

$incident = Call-Json "POST" "$base/incidents" @{
  title = "Incident de recette phase 4"
  description = "Incident cree pour la recette finale et la demonstration."
  priority = "high"
  status = "reported"
  siteId = $site.id
  typeId = $type.id
  createdBy = 1
}

$incidentList = Call-Json "GET" "$base/incidents?search=phase%204&page=1&limit=10"
Assert-True ($incidentList.pagination.total -ge 1) "L'incident cree n'apparait pas dans la liste."

$incident = Call-Json "PUT" "$base/incidents/$($incident.id)" @{
  priority = "critical"
  description = "Description mise a jour pendant la recette."
}

$incident = Call-Json "PATCH" "$base/incidents/$($incident.id)/assignment" @{
  technicianId = $technician.id
}
Assert-True ([string]::IsNullOrWhiteSpace([string]$incident.assigned_at) -eq $false) "assigned_at n'a pas ete renseigne."

$incident = Call-Json "PATCH" "$base/incidents/$($incident.id)/status" @{
  status = "resolved"
}
Assert-True ([string]::IsNullOrWhiteSpace([string]$incident.resolved_at) -eq $false) "resolved_at n'a pas ete renseigne."

$interventions = Call-Json "POST" "$base/incidents/$($incident.id)/interventions" @{
  technicianId = $technician.id
  action = "Recette finale"
  comment = "Intervention creee par le script de verification"
  startedAt = "2026-08-03T14:00:00Z"
  endedAt = "2026-08-03T14:25:00Z"
}

$interventionId = $interventions.data[0].id
Assert-True ($null -ne $interventionId) "L'intervention n'a pas ete creee."

$incidentLogs = Call-Json "GET" "$base/incidents/$($incident.id)/logs"
Assert-True ($incidentLogs.data.Count -ge 3) "Les logs de l'incident sont insuffisants."

$summary = Call-Json "GET" "$base/dashboard/summary"
$recent = Call-Json "GET" "$base/dashboard/recent-incidents?limit=5"
$xmlResponse = Call-Web "GET" "$base/exports/incidents.xml"
Assert-True ($xmlResponse.StatusCode -eq 200) "Le telechargement XML a echoue."

Call-Web "DELETE" "$base/interventions/$interventionId" | Out-Null
Call-Web "DELETE" "$base/incidents/$($incident.id)" | Out-Null
Call-Web "DELETE" "$base/technicians/$($technician.id)" | Out-Null
Call-Web "DELETE" "$base/sites/$($site.id)" | Out-Null
Call-Web "DELETE" "$base/incident-types/$($type.id)" | Out-Null

$deletedCheck = $null
try {
  $deletedCheck = Call-Json "GET" "$base/incidents/$($incident.id)"
} catch {
  $deletedCheck = $_.Exception.Response.StatusCode.value__
}

$report.rootPageStatus = $rootPage.StatusCode
$report.dashboardPageStatus = $dashboardPage.StatusCode
$report.detailPageStatus = $detailPage.StatusCode
$report.createdIds = @{
  siteId = $site.id
  typeId = $type.id
  technicianId = $technician.id
  incidentId = $incident.id
  interventionId = $interventionId
}
$report.incidentStatus = $incident.status
$report.summary = $summary
$report.recentCount = $recent.data.Count
$report.xmlStatus = $xmlResponse.StatusCode
$report.deletedIncidentCheck = $deletedCheck

$report | ConvertTo-Json -Depth 10
