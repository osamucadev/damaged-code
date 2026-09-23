import 'dart:convert';

import 'package:damaged_code/core/network/api_exception.dart';
import 'package:http/http.dart' as http;

typedef JsonMap = Map<String, Object?>;

class ApiClient {
  ApiClient({required String baseUrl, required this.httpClient})
    : _baseUrl = baseUrl.replaceFirst(RegExp(r'/+$'), ''),
      assert(baseUrl.isNotEmpty);

  final String _baseUrl;
  final http.Client httpClient;

  Future<JsonMap> get(String path) async {
    try {
      final response = await httpClient.get(
        Uri.parse('$_baseUrl$path'),
        headers: const {'accept': 'application/json'},
      );

      final Object? decoded;
      try {
        decoded = jsonDecode(response.body);
      } on FormatException {
        throw ApiException('INVALID_RESPONSE', statusCode: response.statusCode);
      }

      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw ApiException(
          _readErrorCode(decoded),
          statusCode: response.statusCode,
        );
      }

      if (decoded is! Map<String, Object?>) {
        throw ApiException('INVALID_RESPONSE', statusCode: response.statusCode);
      }

      return decoded;
    } on ApiException {
      rethrow;
    } on http.ClientException {
      throw const ApiException('NETWORK_ERROR');
    } on Exception {
      throw const ApiException('NETWORK_ERROR');
    }
  }

  String _readErrorCode(Object? decoded) {
    if (decoded is Map<String, Object?>) {
      final error = decoded['error'];
      if (error is Map<String, Object?> && error['code'] is String) {
        return error['code']! as String;
      }
    }
    return 'REQUEST_FAILED';
  }
}
