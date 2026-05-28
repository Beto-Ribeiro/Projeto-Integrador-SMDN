
import 'package:branch1/telas/Relatos.dart';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

void main() async {

  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(

    url: 'https://robfgvtnoooivihlnomr.supabase.co',

    anonKey: 'sb_publishable_eVCeoqzfhoAgkpBnJxzs7w_-PGO0TO9',

  );

  await Supabase.instance.client.auth
      .signInAnonymously();

  runApp(
    const MyApp(),
  );
}

class MyApp extends StatelessWidget {

  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {

    return const MaterialApp(

      debugShowCheckedModeBanner: false,

      home: Relatos_tela(
        title: '',
      ),
    );
  }
}

//url: 'https://robfgvtnoooivihlnomr.supabase.co',
//anonKey: 'sb_publishable_eVCeoqzfhoAgkpBnJxzs7w_-PGO0TO9',