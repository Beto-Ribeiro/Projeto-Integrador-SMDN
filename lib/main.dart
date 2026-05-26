import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'tela_principal.dart'; // Importa a tela do menu

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Carrega o arquivo .env (Certifique-se de que ele existe na raiz do projeto)
  await dotenv.load(fileName: ".env");

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

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