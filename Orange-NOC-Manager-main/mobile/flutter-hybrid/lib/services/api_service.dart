import "dart:convert";
import "dart:io";

import "../config/api_config.dart";
import "../models/incident.dart";

class ApiException implements Exception {
  const ApiException(this.message);

  final String message;

  @override
  String toString() => message;
}

class ApiService {
  ApiService({String? baseUrl}) : _baseUrl = baseUrl ?? ApiConfig.defaultBaseUrl;

  final String _baseUrl;

  Future<List<IncidentListItem>> fetchIncidents() async {
    final payload = await _request("/incidents?page=1&limit=50");
    final data = payload["data"] as List<dynamic>? ?? <dynamic>[];
    return data
        .map((item) => IncidentListItem.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<IncidentDetail> fetchIncident(int id) async {
    final payload = await _request("/incidents/$id");
    return IncidentDetail.fromJson(payload);
  }

  Future<void> updatePriority(int id, String priority) async {
    await _request(
      "/incidents/$id",
      method: "PUT",
      body: {"priority": priority},
    );
  }

  Future<void> updateStatus(int id, String status) async {
    await _request(
      "/incidents/$id/status",
      method: "PATCH",
      body: {"status": status},
    );
  }

  Future<void> deleteIncident(int id) async {
    await _request(
      "/incidents/$id",
      method: "DELETE",
      expectJson: false,
    );
  }

  Future<Map<String, dynamic>> _request(
    String path, {
    String method = "GET",
    Map<String, dynamic>? body,
    bool expectJson = true,
  }) async {
    final client = HttpClient();

    try {
      final request = await client.openUrl(method, Uri.parse("$_baseUrl$path"));
      request.headers.contentType = ContentType.json;
      request.headers.set(HttpHeaders.acceptHeader, expectJson ? "application/json" : "*/*");

      if (body != null) {
        request.write(jsonEncode(body));
      }

      final response = await request.close();
      final raw = await response.transform(utf8.decoder).join();

      if (response.statusCode < 200 || response.statusCode > 299) {
        if (raw.isNotEmpty) {
          try {
            final parsed = jsonDecode(raw) as Map<String, dynamic>;
            throw ApiException((parsed["message"] ?? "Erreur API.").toString());
          } catch (_) {
            throw ApiException(raw);
          }
        }
        throw ApiException("Erreur API ${response.statusCode}");
      }

      if (!expectJson || raw.isEmpty) {
        return <String, dynamic>{};
      }

      final decoded = jsonDecode(raw);
      if (decoded is Map<String, dynamic>) {
        return decoded;
      }

      throw const ApiException("Reponse API non valide.");
    } on SocketException {
      throw const ApiException("API indisponible. Verifiez que le backend tourne sur la machine hote.");
    } finally {
      client.close();
    }
  }
}
