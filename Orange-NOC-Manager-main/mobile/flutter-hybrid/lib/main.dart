import "package:flutter/material.dart";

import "pages/incidents_page.dart";

void main() {
  runApp(const OrangeNocApp());
}

class OrangeNocApp extends StatelessWidget {
  const OrangeNocApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: "Orange NOC Manager",
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFFF7900),
          primary: const Color(0xFFFF7900),
        ),
        scaffoldBackgroundColor: const Color(0xFFF5F5F5),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF111111),
          foregroundColor: Colors.white,
        ),
        useMaterial3: true,
      ),
      home: const IncidentsPage(),
    );
  }
}
