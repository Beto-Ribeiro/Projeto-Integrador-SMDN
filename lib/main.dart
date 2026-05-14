
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'telas/exportador_import.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: 'https://robfgvtnoooivihlnomr.supabase.co',
    anonKey: 'sb_publishable_eVCeoqzfhoAgkpBnJxzs7w_-PGO0TO9',
  );

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.blueAccent,
        ),
      ),
      home: const Cadastro_tela(title: 'maco'),
    );
  }
}


