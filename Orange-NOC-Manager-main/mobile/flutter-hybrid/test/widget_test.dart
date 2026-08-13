import "package:orange_noc_manager_flutter/main.dart";
import "package:flutter_test/flutter_test.dart";

void main() {
  testWidgets("Application Flutter s'ouvre", (WidgetTester tester) async {
    await tester.pumpWidget(const OrangeNocApp());

    expect(find.text("Orange NOC Manager"), findsOneWidget);
    expect(find.text("Incidents"), findsOneWidget);
  });
}
