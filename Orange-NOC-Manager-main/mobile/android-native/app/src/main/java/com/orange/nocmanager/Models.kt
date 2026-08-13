package com.orange.nocmanager

data class IncidentListItem(
    val id: Int,
    val reference: String,
    val title: String,
    val priority: String,
    val status: String,
    val siteName: String,
    val technicianName: String,
    val createdAt: String
)

data class IncidentDetail(
    val id: Int,
    val reference: String,
    val title: String,
    val description: String,
    val priority: String,
    val status: String,
    val createdAt: String,
    val updatedAt: String,
    val assignedAt: String,
    val resolvedAt: String,
    val closedAt: String,
    val siteName: String,
    val siteCode: String,
    val typeLabel: String,
    val technicianName: String,
    val interventions: List<InterventionItem>
)

data class InterventionItem(
    val action: String,
    val comment: String,
    val startedAt: String,
    val endedAt: String,
    val technicianName: String
)
