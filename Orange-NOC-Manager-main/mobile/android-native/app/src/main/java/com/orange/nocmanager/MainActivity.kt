package com.orange.nocmanager

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.ListView
import android.widget.ProgressBar
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import java.util.concurrent.Executors

class MainActivity : AppCompatActivity() {
    private val executor = Executors.newSingleThreadExecutor()

    private lateinit var progressBar: ProgressBar
    private lateinit var errorText: TextView
    private lateinit var retryButton: Button
    private lateinit var incidentListView: ListView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        progressBar = findViewById(R.id.progressBar)
        errorText = findViewById(R.id.errorText)
        retryButton = findViewById(R.id.retryButton)
        incidentListView = findViewById(R.id.incidentListView)

        retryButton.setOnClickListener {
            loadIncidents()
        }

        loadIncidents()
    }

    private fun loadIncidents() {
        showLoadingState()

        executor.execute {
            try {
                val incidents = ApiClient.fetchIncidents()

                runOnUiThread {
                    val adapter = IncidentListAdapter(this, incidents)
                    incidentListView.adapter = adapter
                    incidentListView.setOnItemClickListener { _, _, position, _ ->
                        val selected = incidents[position]
                        val intent = Intent(this, IncidentDetailActivity::class.java)
                        intent.putExtra("incident_id", selected.id)
                        startActivity(intent)
                    }
                    showListState()
                }
            } catch (error: Exception) {
                runOnUiThread {
                    showErrorState(error.message ?: "Impossible de charger les incidents.")
                }
            }
        }
    }

    private fun showLoadingState() {
        progressBar.visibility = View.VISIBLE
        errorText.visibility = View.GONE
        retryButton.visibility = View.GONE
        incidentListView.visibility = View.GONE
    }

    private fun showListState() {
        progressBar.visibility = View.GONE
        errorText.visibility = View.GONE
        retryButton.visibility = View.GONE
        incidentListView.visibility = View.VISIBLE
    }

    private fun showErrorState(message: String) {
        progressBar.visibility = View.GONE
        errorText.visibility = View.VISIBLE
        retryButton.visibility = View.VISIBLE
        incidentListView.visibility = View.GONE
        errorText.text = message
    }
}
