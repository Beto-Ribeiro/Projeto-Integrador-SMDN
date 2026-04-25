import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

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

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        colorScheme: .fromSeed(seedColor: Colors.blueAccent),
      ),
      home: const MyHomePage(title: 'SMDN Tela de Cadastro'),
    );
  }
}

class EmailTextbox extends StatelessWidget {
  const EmailTextbox({super.key});

  @override
  Widget build(BuildContext context) {
    return const SizedBox(
      width: 350,
      child: TextField(
        obscureText: false,
        decoration: InputDecoration(
          border: OutlineInputBorder(),
          labelText: 'Digite seu E-mail',
        ),
      ),
    );
  }
}

class SenhaTextbox extends StatelessWidget {
  const SenhaTextbox({super.key});

  @override
  Widget build(BuildContext context) {
    return const SizedBox(
      width: 350,
      child: TextField(
        obscureText: false,
        decoration: InputDecoration(
          border: OutlineInputBorder(),
          labelText: 'Digite sua senha',
        ),
      ),
    );
  }
}

class ConSenhaTextbox extends StatelessWidget {
  const ConSenhaTextbox({super.key});

  @override
  Widget build(BuildContext context) {
    return const SizedBox(
      width: 350,
      child: TextField(
        obscureText: false,
        decoration: InputDecoration(
          border: OutlineInputBorder(),
          labelText: 'Confirme sua senha',
        ),
      ),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  // This widget is the home page of your application. It is stateful, meaning
  // that it has a State object (defined below) that contains fields that affect
  // how it looks.

  // This class is the configuration for the state. It holds the values (in this
  // case the title) provided by the parent (in this case the App widget) and
  // used by the build method of the State. Fields in a Widget subclass are
  // always marked "final".

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  int _counter = 0;

  void _incrementCounter() {
    setState(() {
      _counter++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.blueGrey[600],
      body: SafeArea(
        child: Column(
          verticalDirection: VerticalDirection.up,
          mainAxisSize: MainAxisSize.max,
          children: <Widget>[

            Container(
              padding: EdgeInsets.fromLTRB(25, 100, 25, 100),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(30),
                  topRight: Radius.circular(30),
                ), // Rounds all corners by 20 pixels
              ),
              child: Column(
                spacing: 30,
                mainAxisSize: MainAxisSize.max,
                children: <Widget>[
                  Row(
                    mainAxisSize: MainAxisSize.max,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: <Widget>[
                      Text(
                        style: TextStyle(
                          fontSize: 30,
                          fontWeight: FontWeight.w700,
                          color: Colors.blueGrey,
                        ),
                        "Vamos Começar??",
                      ),
                    ],
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.max,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      EmailTextbox(),
                    ],
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.max,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      SenhaTextbox(),
                    ],
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.max,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      ConSenhaTextbox(),
                    ],
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.max,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      ElevatedButton(
                        onPressed: () {
                          // ação ao clicar
                          print('Botão Enviar pressionado');
                        },
                        child: Text('Enviar'),
                      )
                    ],
                  )
                ],
              ),
            ),
            Container(
              margin: EdgeInsets.fromLTRB(0, 100, 0, 150),
              child: Text(
                style: TextStyle(
                  fontSize: 40,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
                "SMDN",
              ),
            ),
          ],
        ),
      ),
        floatingActionButton: FloatingActionButton(
          onPressed: () {
            showDialog(
              context: context,
              builder: ((context) {
                return SimpleDialog(
                  title: const Text('Add a Note'),
                  contentPadding:
                  const EdgeInsets.symmetric(horizontal: 30 ),
                  children: [
                    TextFormField(
                      onFieldSubmitted: (value) async {
                        await Supabase.instance.client
                            .from('Notas')
                            .insert({'body': value});
                      },
                    ), // TextFormField
                  ],
                ); // SimpleDialog
              }),
            );
          },
          child: const Icon(Icons.add),
        ),
    );
  }
}
