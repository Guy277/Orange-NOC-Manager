package com.orange.nocmanager

import android.os.Bundle
import android.view.View
import android.widget.ProgressBar
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import java.util.concurrent.Executors

class IncidentDetailActivity : AppCompatActivity() {
    private val executor = Executors.newSingleThreadExecutor()

    private lateinit var progressBar: ProgressBar
    private lateinit var detailText: TextView
    private lateinit var errorText: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_incident_detail)

        progressBar = findViewById(R.id.progressBar)
        detailText = findViewById(R.id.detailText)
        errorText = findViewById(R.id.errorText)

        val incidentId = intent.getIntExtra("incident_id", -1)
        if (incidentId <= 0) {
            showError("Identifiant d'incident invalide.")
            return
        }

        title = "Detail incident"
        loadIncidentDetail(incidentId)
    }

    private fun loadIncidentDetail(incidentId: Int) {
        showLoading()

        executor.execute {
            try {
                val incident = ApiClient.fetchIncidentDetail(incidentId)
                val formattedInterventions = if (incident.interventions.isEmpty()) {
                    "Aucune intervention"
                } else {
                    incident.interventions.joinToString("\n\n") { intervention ->
                        "- Action: ${intervention.action}\n" +
                            "  Commentaire: ${intervention.comment}\n" +
                            "  Technicien: ${intervention.technicianName}\n" +
                            "  Debut: ${intervention.startedAt}\n" +
                            "  Fin: ${intervention.endedAt}"
                    }
                }

                val content = """
                    Reference: ${incident.reference}

                    Titre: ${incident.title}

                    Description:
                    ${incident.description}

                    Priorite: ${incident.priority}
                    Statut: ${incident.status}
                    Site: ${incident.siteCode} - ${incident.siteName}
                    Type: ${incident.typeLabel}
                    Technicien: ${incident.technicianName}

                    Creation: ${incident.createdAt}
                    Mise a jour: ${incident.updatedAt}
                    Affectation: ${incident.assignedAt}
                    Resolution: ${incident.resolvedAt}
                    Cloture: ${incident.closedAt}

                    Interventions:
                    $formattedInterventions
                """.trimIndent()

                runOnUiThread {
                    progressBar.visibility = View.GONE
                    errorText.visibility = View.GONE
                    detailText.visibility = View.VISIBLE
                    detailText.text = content
                }
            } catch (error: Exception) {
                runOnUiThread {
                    showError(error.message ?: "Impossible de charger le detail.")
                }
            }
        }
    }

    private fun showLoading() {
        progressBar.visibility = View.VISIBLE
        errorText.visibility = View.GONE
        detailText.visibility = View.GONE
    }

    private fun showError(message: String) {
        progressBar.visibility = View.GONE
        detailText.visibility = View.GONE
        errorText.visibility = View.VISIBLE
        errorText.text = message
    }
}
