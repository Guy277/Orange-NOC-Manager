import "package:flutter/material.dart";

import "../models/incident.dart";
import "../services/api_service.dart";
import "../widgets/status_badge.dart";
import "incident_detail_page.dart";

class IncidentsPage extends StatefulWidget {
  const IncidentsPage({super.key});

  @override
  State<IncidentsPage> createState() => _IncidentsPageState();
}

class _IncidentsPageState extends State<IncidentsPage> {
  final ApiService _apiService = ApiService();
  late Future<List<IncidentListItem>> _future;

  @override
  void initState() {
    super.initState();
    _future = _apiService.fetchIncidents();
  }

  void _reload() {
    setState(() {
      _future = _apiService.fetchIncidents();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Incidents"),
        actions: [
          IconButton(
            onPressed: _reload,
            icon: const Icon(Icons.refresh),
            tooltip: "Rafraichir",
          ),
        ],
      ),
      body: FutureBuilder<List<IncidentListItem>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return _ErrorPanel(
              message: snapshot.error.toString(),
              onRetry: _reload,
            );
          }

          final incidents = snapshot.data ?? <IncidentListItem>[];
          if (incidents.isEmpty) {
            return const _EmptyPanel();
          }

          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: incidents.length,
            separatorBuilder: (_, _) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final incident = incidents[index];
              return Card(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                child: ListTile(
                  contentPadding: const EdgeInsets.all(16),
                  title: Text(
                    incident.title,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  subtitle: Padding(
                    padding: const EdgeInsets.only(top: 10),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(incident.reference, style: const TextStyle(color: Color(0xFFFF7900))),
                        const SizedBox(height: 10),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            PriorityBadge(value: incident.priority),
                            StatusBadge(value: incident.status),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Text("Site : ${incident.siteName}"),
                        Text("Type : ${incident.typeLabel}"),
                        Text("Technicien : ${incident.technicianName ?? "Non affecte"}"),
                      ],
                    ),
                  ),
                  onTap: () async {
                    await Navigator.of(context).push(
                      MaterialPageRoute<void>(
                        builder: (_) => IncidentDetailPage(
                          incidentId: incident.id,
                          apiService: _apiService,
                        ),
                      ),
                    );
                    _reload();
                  },
                ),
              );
            },
          );
        },
      ),
    );
  }
}

class _ErrorPanel extends StatelessWidget {
  const _ErrorPanel({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.wifi_off, color: Color(0xFFDC2626), size: 42),
            const SizedBox(height: 16),
            const Text(
              "Erreur de chargement",
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(message, textAlign: TextAlign.center),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: onRetry,
              child: const Text("Reessayer"),
            ),
          ],
        ),
      ),
    );
  }
}

class _EmptyPanel extends StatelessWidget {
  const _EmptyPanel();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.inbox_outlined, size: 42, color: Color(0xFF6B7280)),
            SizedBox(height: 16),
            Text(
              "Aucun incident disponible",
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }
}
