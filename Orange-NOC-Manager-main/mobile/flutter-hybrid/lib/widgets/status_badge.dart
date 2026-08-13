import "package:flutter/material.dart";

class StatusBadge extends StatelessWidget {
  const StatusBadge({super.key, required this.value});

  final String value;

  @override
  Widget build(BuildContext context) {
    final tone = switch (value) {
      "reported" => const Color(0xFF2563EB),
      "qualified" => const Color(0xFF2563EB),
      "assigned" => const Color(0xFFF59E0B),
      "in_progress" => const Color(0xFFFF7900),
      "resolved" => const Color(0xFF16A34A),
      "closed" => const Color(0xFF16A34A),
      "cancelled" => const Color(0xFFDC2626),
      _ => const Color(0xFF6B7280),
    };

    return _Badge(label: _statusLabel(value), color: tone);
  }
}

class PriorityBadge extends StatelessWidget {
  const PriorityBadge({super.key, required this.value});

  final String value;

  @override
  Widget build(BuildContext context) {
    final tone = switch (value) {
      "low" => const Color(0xFF2563EB),
      "medium" => const Color(0xFFF59E0B),
      "high" => const Color(0xFFFF7900),
      "critical" => const Color(0xFFDC2626),
      _ => const Color(0xFF6B7280),
    };

    return _Badge(label: _priorityLabel(value), color: tone);
  }
}

class _Badge extends StatelessWidget {
  const _Badge({required this.label, required this.color});

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.14),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontWeight: FontWeight.w700,
          fontSize: 12,
        ),
      ),
    );
  }
}

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

String _priorityLabel(String value) => switch (value) {
      "low" => "Faible",
      "medium" => "Moyenne",
      "high" => "Haute",
      "critical" => "Critique",
      _ => value,
    };
