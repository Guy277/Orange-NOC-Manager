package com.orange.nocmanager

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.TextView

class IncidentListAdapter(
    context: Context,
    incidents: List<IncidentListItem>
) : ArrayAdapter<IncidentListItem>(context, 0, incidents) {

    override fun getView(position: Int, convertView: View?, parent: ViewGroup): View {
        val view = convertView ?: LayoutInflater.from(context)
            .inflate(R.layout.item_incident, parent, false)

        val item = getItem(position) ?: return view

        view.findViewById<TextView>(R.id.referenceText).text = item.reference
        view.findViewById<TextView>(R.id.titleText).text = item.title
        view.findViewById<TextView>(R.id.metaText).text =
            "Priorite: ${item.priority} | Statut: ${item.status}"
        view.findViewById<TextView>(R.id.siteText).text =
            "Site: ${item.siteName} | Technicien: ${item.technicianName}"

        return view
    }
}
