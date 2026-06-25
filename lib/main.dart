import 'package:branch1/telas/discarded/discarded_home.dart';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'telas/exportador_import.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: 'https://robfgvtnoooivihlnomr.supabase.co',
    anonKey: 'sb_publishable_eVCeoqzfhoAgkpBnJxzs7w_-PGO0TO9',
  );

  // Carrega o arquivo .env (Certifique-se de que ele existe na raiz do projeto)
  await dotenv.load(fileName: ".env");

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override


  @override
  Widget build(BuildContext context) {

    return MaterialApp(
      title: 'SMDN App',
      debugShowCheckedModeBanner: false, // Tira aquela faixa de "DEBUG" da tela
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blueAccent),
      ),
      // O aplicativo abre direto aqui!
      home: const TelaPrincipal(),
    );
  }
}