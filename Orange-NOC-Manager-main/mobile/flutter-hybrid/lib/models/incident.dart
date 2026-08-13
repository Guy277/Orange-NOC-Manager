class IncidentListItem {
  const IncidentListItem({
    required this.id,
    required this.reference,
    required this.title,
    required this.priority,
    required this.status,
    required this.siteName,
    required this.typeLabel,
    required this.technicianName,
    required this.createdAt,
  });

  final int id;
  final String reference;
  final String title;
  final String priority;
  final String status;
  final String siteName;
  final String typeLabel;
  final String? technicianName;
  final String createdAt;

  factory IncidentListItem.fromJson(Map<String, dynamic> json) {
    return IncidentListItem(
      id: json["id"] as int,
      reference: (json["reference"] ?? "") as String,
      title: (json["title"] ?? "") as String,
      priority: (json["priority"] ?? "") as String,
      status: (json["status"] ?? "") as String,
      siteName: (json["site_name"] ?? "") as String,
      typeLabel: (json["type_label"] ?? "") as String,
      technicianName: json["technician_name"] as String?,
      createdAt: (json["created_at"] ?? "") as String,
    );
  }
}

class IncidentDetail {
  const IncidentDetail({
    required this.id,
    required this.reference,
    required this.title,
    required this.description,
    required this.priority,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    required this.assignedAt,
    required this.resolvedAt,
    required this.closedAt,
    required this.site,
    required this.incidentType,
    required this.technician,
    required this.createdBy,
    required this.interventions,
  });

  final int id;
  final String reference;
  final String title;
  final String description;
  final String priority;
  final String status;
  final String createdAt;
  final String updatedAt;
  final String? assignedAt;
  final String? resolvedAt;
  final String? closedAt;
  final SiteInfo site;
  final IncidentTypeInfo incidentType;
  final TechnicianInfo? technician;
  final CreatedByInfo createdBy;
  final List<InterventionItem> interventions;

  factory IncidentDetail.fromJson(Map<String, dynamic> json) {
    final interventionsRaw = (json["interventions"] as List<dynamic>? ?? <dynamic>[]);

    return IncidentDetail(
      id: json["id"] as int,
      reference: (json["reference"] ?? "") as String,
      title: (json["title"] ?? "") as String,
      description: (json["description"] ?? "") as String,
      priority: (json["priority"] ?? "") as String,
      status: (json["status"] ?? "") as String,
      createdAt: (json["created_at"] ?? "") as String,
      updatedAt: (json["updated_at"] ?? "") as String,
      assignedAt: json["assigned_at"] as String?,
      resolvedAt: json["resolved_at"] as String?,
      closedAt: json["closed_at"] as String?,
      site: SiteInfo.fromJson(json["site"] as Map<String, dynamic>),
      incidentType: IncidentTypeInfo.fromJson(json["incident_type"] as Map<String, dynamic>),
      technician: json["technician"] == null
          ? null
          : TechnicianInfo.fromJson(json["technician"] as Map<String, dynamic>),
      createdBy: CreatedByInfo.fromJson(json["created_by"] as Map<String, dynamic>),
      interventions: interventionsRaw
          .map((item) => InterventionItem.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
  }
}

class SiteInfo {
  const SiteInfo({
    required this.id,
    required this.code,
    required this.name,
    required this.city,
    required this.region,
    required this.siteType,
  });

  final int id;
  final String code;
  final String name;
  final String city;
  final String region;
  final String siteType;

  factory SiteInfo.fromJson(Map<String, dynamic> json) {
    return SiteInfo(
      id: json["id"] as int,
      code: (json["code"] ?? "") as String,
      name: (json["name"] ?? "") as String,
      city: (json["city"] ?? "") as String,
      region: (json["region"] ?? "") as String,
      siteType: (json["siteType"] ?? "") as String,
    );
  }
}

class IncidentTypeInfo {
  const IncidentTypeInfo({
    required this.id,
    required this.label,
    required this.description,
    required this.requiredSpecialty,
  });

  final int id;
  final String label;
  final String description;
  final String requiredSpecialty;

  factory IncidentTypeInfo.fromJson(Map<String, dynamic> json) {
    return IncidentTypeInfo(
      id: json["id"] as int,
      label: (json["label"] ?? "") as String,
      description: (json["description"] ?? "") as String,
      requiredSpecialty: (json["requiredSpecialty"] ?? "") as String,
    );
  }
}

class TechnicianInfo {
  const TechnicianInfo({
    required this.id,
    required this.name,
    required this.email,
    required this.specialty,
    required this.zone,
  });

  final int id;
  final String name;
  final String email;
  final String specialty;
  final String zone;

  factory TechnicianInfo.fromJson(Map<String, dynamic> json) {
    return TechnicianInfo(
      id: json["id"] as int,
      name: (json["name"] ?? "") as String,
      email: (json["email"] ?? "") as String,
      specialty: (json["specialty"] ?? "") as String,
      zone: (json["zone"] ?? "") as String,
    );
  }
}

class CreatedByInfo {
  const CreatedByInfo({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
  });

  final int id;
  final String name;
  final String email;
  final String role;

  factory CreatedByInfo.fromJson(Map<String, dynamic> json) {
    return CreatedByInfo(
      id: json["id"] as int,
      name: (json["name"] ?? "") as String,
      email: (json["email"] ?? "") as String,
      role: (json["role"] ?? "") as String,
    );
  }
}

class InterventionItem {
  const InterventionItem({
    required this.id,
    required this.action,
    required this.comment,
    required this.startedAt,
    required this.endedAt,
    required this.durationMinutes,
    required this.technicianName,
  });

  final int id;
  final String action;
  final String comment;
  final String startedAt;
  final String? endedAt;
  final int? durationMinutes;
  final String technicianName;

  factory InterventionItem.fromJson(Map<String, dynamic> json) {
    final technician = json["technician"] as Map<String, dynamic>? ?? <String, dynamic>{};
    return InterventionItem(
      id: json["id"] as int,
      action: (json["action"] ?? "") as String,
      comment: (json["comment"] ?? "") as String,
      startedAt: (json["started_at"] ?? "") as String,
      endedAt: json["ended_at"] as String?,
      durationMinutes: json["duration_minutes"] as int?,
      technicianName: (technician["name"] ?? "Non renseigne") as String,
    );
  }
}
