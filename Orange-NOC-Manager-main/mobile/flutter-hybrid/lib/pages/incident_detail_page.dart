import "package:flutter/material.dart";

import "../models/incident.dart";
import "../services/api_service.dart";
import "../widgets/status_badge.dart";

class IncidentDetailPage extends StatefulWidget {
  const IncidentDetailPage({
    super.key,
    required this.incidentId,
    required this.apiService,
  });

  final int incidentId;
  final ApiService apiService;

  @override
  State<IncidentDetailPage> createState() => _IncidentDetailPageState();
}

class _IncidentDetailPageState extends State<IncidentDetailPage> {
  late Future<IncidentDetail> _future;
  bool _busy = false;

  static const List<String> _priorities = <String>["low", "medium", "high", "critical"];
  static const List<String> _statuses = <String>[
    "reported",
    "qualified",
    "assigned",
    "in_progress",
    "resolved",
    "closed",
    "cancelled"
  ];

  @override
  void initState() {
    super.initState();
    _future = widget.apiService.fetchIncident(widget.incidentId);
  }

  void _reload() {
    setState(() {
      _future = widget.apiService.fetchIncident(widget.incidentId);
    });
  }

  Future<void> _handlePriorityChange(String value) async {
    setState(() => _busy = true);
    try {
      await widget.apiService.updatePriority(widget.incidentId, value);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Priorite mise a jour.")),
        );
      }
      _reload();
    } catch (error) {
      _showError(error.toString());
    } finally {
      if (mounted) {
        setState(() => _busy = false);
      }
    }
  }

  Future<void> _handleStatusChange(String value) async {
    setState(() => _busy = true);
    try {
      await widget.apiService.updateStatus(widget.incidentId, value);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Statut mis a jour.")),
        );
      }
      _reload();
    } catch (error) {
      _showError(error.toString());
    } finally {
      if (mounted) {
        setState(() => _busy = false);
      }
    }
  }

  Future<void> _handleDelete() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text("Supprimer l'incident"),
          content: const Text("Confirmer la suppression de cet incident ?"),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text("Annuler"),
            ),
            FilledButton(
              style: FilledButton.styleFrom(backgroundColor: const Color(0xFFDC2626)),
              onPressed: () => Navigator.of(context).pop(true),
              child: const Text("Supprimer"),
            ),
          ],
        );
      },
    );

    if (confirmed != true) {
      return;
    }

    setState(() => _busy = true);
    try {
      await widget.apiService.deleteIncident(widget.incidentId);
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Incident supprime.")),
      );
      Navigator.of(context).pop();
    } catch (error) {
      _showError(error.toString());
      if (mounted) {
        setState(() => _busy = false);
      }
    }
  }

  void _showError(String message) {
    if (!mounted) {
      return;
    }
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message.replaceFirst("ApiException: ", ""))),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Detail incident"),
        actions: [
          IconButton(
            onPressed: _busy ? null : _reload,
            icon: const Icon(Icons.refresh),
          ),
          IconButton(
            onPressed: _busy ? null : _handleDelete,
            icon: const Icon(Icons.delete_outline),
          ),
        ],
      ),
      body: FutureBuilder<IncidentDetail>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Text(snapshot.error.toString()),
              ),
            );
          }

          final incident = snapshot.data!;

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Card(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        incident.reference,
                        style: const TextStyle(
                          color: Color(0xFFFF7900),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        incident.title,
                        style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 12),
                      Text(incident.description),
                      const SizedBox(height: 16),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          PriorityBadge(value: incident.priority),
                          StatusBadge(value: incident.status),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Card(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        "Actions rapides",
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 16),
                      DropdownButtonFormField<String>(
                        value: incident.priority,
                        decoration: const InputDecoration(labelText: "Modifier la priorite"),
                        items: _priorities
                            .map(
                              (value) => DropdownMenuItem<String>(
                                value: value,
                                child: Text(_priorityLabel(value)),
                              ),
                            )
                            .toList(),
                        onChanged: _busy
                            ? null
                            : (value) {
                                if (value != null && value != incident.priority) {
                                  _handlePriorityChange(value);
                                }
                              },
                      ),
                      const SizedBox(height: 16),
                      DropdownButtonFormField<String>(
                        value: incident.status,
                        decoration: const InputDecoration(labelText: "Modifier le statut"),
                        items: _statuses
                            .map(
                              (value) => DropdownMenuItem<String>(
                                value: value,
                                child: Text(_statusLabel(value)),
                              ),
                            )
                            .toList(),
                        onChanged: _busy
                            ? null
                            : (value) {
                                if (value != null && value != incident.status) {
                                  _handleStatusChange(value);
                                }
                              },
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Card(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        "Informations",
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 12),
                      _InfoLine(label: "Site", value: "${incident.site.code} - ${incident.site.name}"),
                      _InfoLine(label: "Type", value: incident.incidentType.label),
                      _InfoLine(label: "Technicien", value: incident.technician?.name ?? "Non affecte"),
                      _InfoLine(label: "Cree par", value: incident.createdBy.name),
                      _InfoLine(label: "Creation", value: incident.createdAt),
                      _InfoLine(label: "Mise a jour", value: incident.updatedAt),
                      _InfoLine(label: "Affectation", value: incident.assignedAt ?? "Non renseignee"),
                      _InfoLine(label: "Resolution", value: incident.resolvedAt ?? "Non renseignee"),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Card(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        "Interventions",
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 12),
                      if (incident.interventions.isEmpty)
                        const Text("Aucune intervention")
                      else
                        ...incident.interventions.map(
                          (intervention) => Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF8FAFC),
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    intervention.action,
                                    style: const TextStyle(fontWeight: FontWeight.bold),
                                  ),
                                  const SizedBox(height: 6),
                                  Text(intervention.comment),
                                  const SizedBox(height: 6),
                                  Text("Technicien : ${intervention.technicianName}"),
                                  Text("Debut : ${intervention.startedAt}"),
                                  Text("Fin : ${intervention.endedAt ?? "Non renseignee"}"),
                                ],
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _InfoLine extends StatelessWidget {
  const _InfoLine({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: RichText(
        text: TextSpan(
          style: DefaultTextStyle.of(context).style,
          children: [
            TextSpan(
              text: "$label : ",
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            TextSpan(text: value),
          ],
        ),
      ),
    );
  }
}

String _priorityLabel(String value) => switch (value) {
      "low" => "Faible",
      "medium" => "Moyenne",
      "high" => "Haute",
      "critical" => "Critique",
      _ => value,
    };

String _statusLabel(String value) => switch (value) {
      "reported" => "Declare",
      "qualified" => "Qualifie",
      "assigned" => "Affecte",
      "in_progress" => "En cours",
      "resolved" => "Resolue",
      "closed" => "Cloturee",
      "cancelled" => "Annulee",
      _ => value,
    };
