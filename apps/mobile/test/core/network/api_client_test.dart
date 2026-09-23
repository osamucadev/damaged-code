import 'package:damaged_code/core/network/api_client.dart';
import 'package:damaged_code/core/network/api_exception.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

void main() {
  test('returns a decoded project envelope', () async {
    final client = ApiClient(
      baseUrl: 'https://api.example.test/',
      httpClient: MockClient((request) async {
        expect(request.url.toString(), 'https://api.example.test/v1/episodes');
        expect(request.headers['accept'], 'application/json');
        return http.Response('{"data":[]}', 200);
      }),
    );

    expect(await client.get('/v1/episodes'), {'data': <Object?>[]});
  });

  test(
    'preserves the stable API error code without exposing the message',
    () async {
      final client = ApiClient(
        baseUrl: 'https://api.example.test',
        httpClient: MockClient(
          (_) async => http.Response(
            '{"error":{"code":"UPSTREAM_UNAVAILABLE","message":"safe"}}',
            502,
          ),
        ),
      );

      await expectLater(
        client.get('/v1/episodes'),
        throwsA(
          isA<ApiException>()
              .having((error) => error.code, 'code', 'UPSTREAM_UNAVAILABLE')
              .having((error) => error.statusCode, 'statusCode', 502),
        ),
      );
    },
  );

  test('normalizes malformed successful responses', () async {
    final client = ApiClient(
      baseUrl: 'https://api.example.test',
      httpClient: MockClient((_) async => http.Response('not json', 200)),
    );

    await expectLater(
      client.get('/v1/episodes'),
      throwsA(
        isA<ApiException>().having(
          (error) => error.code,
          'code',
          'INVALID_RESPONSE',
        ),
      ),
    );
  });
}
