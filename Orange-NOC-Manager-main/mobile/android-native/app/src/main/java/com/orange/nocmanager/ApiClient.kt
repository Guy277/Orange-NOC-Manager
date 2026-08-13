package com.orange.nocmanager

import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

object ApiClient {
    private const val baseUrl = AppConfig.apiBaseUrl

    fun fetchIncidents(): List<IncidentListItem> {
        val response = getJsonObject("$baseUrl/incidents?page=1&limit=20")
        val incidents = response.getJSONArray("data")
        return parseIncidents(incidents)
    }

    fun fetchIncidentDetail(incidentId: Int): IncidentDetail {
        val response = getJsonObject("$baseUrl/incidents/$incidentId")
        return IncidentDetail(
            id = response.getInt("id"),
            reference = response.getString("reference"),
            title = response.getString("title"),
            description = response.getString("description"),
            priority = response.getString("priority"),
            status = response.getString("status"),
            createdAt = response.optString("created_at"),
            updatedAt = response.optString("updated_at"),
            assignedAt = response.optString("assigned_at"),
            resolvedAt = response.optString("resolved_at"),
            closedAt = response.optString("closed_at"),
            siteName = response.getJSONObject("site").optString("name"),
            siteCode = response.getJSONObject("site").optString("code"),
            typeLabel = response.getJSONObject("incident_type").optString("label"),
            technicianName = response.optJSONObject("technician")?.optString("name") ?: "Non affecte",
            interventions = parseInterventions(response.optJSONArray("interventions") ?: JSONArray())
        )
    }

    private fun getJsonObject(url: String): JSONObject {
        val connection = URL(url).openConnection() as HttpURLConnection
        connection.requestMethod = "GET"
        connection.setRequestProperty("Accept", "application/json")
        connection.connectTimeout = 10_000
        connection.readTimeout = 10_000

        return try {
            val stream = if (connection.responseCode in 200..299) {
                connection.inputStream
            } else {
                connection.errorStream
            }

            val body = stream.bufferedReader().use { it.readText() }

            if (connection.responseCode !in 200..299) {
                throw IllegalStateException("API error ${connection.responseCode}: $body")
            }

            JSONObject(body)
        } finally {
            connection.disconnect()
        }
    }

    private fun parseIncidents(incidents: JSONArray): List<IncidentListItem> {
        val result = mutableListOf<IncidentListItem>()

        for (index in 0 until incidents.length()) {
            val item = incidents.getJSONObject(index)
            result.add(
                IncidentListItem(
                    id = item.getInt("id"),
                    reference = item.optString("reference"),
                    title = item.optString("title"),
                    priority = item.optString("priority"),
                    status = item.optString("status"),
                    siteName = item.optString("site_name"),
                    technicianName = item.optString("technician_name").ifBlank { "Non affecte" },
                    createdAt = item.optString("created_at")
                )
            )
        }

        return result
    }

    private fun parseInterventions(interventions: JSONArray): List<InterventionItem> {
        val result = mutableListOf<InterventionItem>()

        for (index in 0 until interventions.length()) {
            val item = interventions.getJSONObject(index)
            result.add(
                InterventionItem(
                    action = item.optString("action"),
                    comment = item.optString("comment"),
                    startedAt = item.optString("started_at"),
                    endedAt = item.optString("ended_at"),
                    technicianName = item.optJSONObject("technician")?.optString("name") ?: "Non renseigne"
                )
            )
        }

        return result
    }
}
