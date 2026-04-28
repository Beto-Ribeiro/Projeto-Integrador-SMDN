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

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  bool _estaCarregando = false;

  final _NomeController = TextEditingController();
  final _CPFController = TextEditingController();
  final _TelController = TextEditingController();
  final _EmailController = TextEditingController();
  final _SenhaController = TextEditingController();
  final _ConSenhaController = TextEditingController();

  // Função que o botão vai chamar
  Future<void> _enviarDados() async {
    setState(() {
      _estaCarregando = true;
    });
    // Aqui nós "puxamos" os valores atuais dos controladores
    String Nome = _NomeController.text;
    String CPF = _CPFController.text;
    String Tel = _TelController.text;
    String Email = _EmailController.text;
    String Senha = _SenhaController.text;
    String Conf_senha = _ConSenhaController.text;

    if (Nome.isNotEmpty || CPF.isNotEmpty || Tel.isNotEmpty || Email.isNotEmpty || Senha.isNotEmpty || Conf_senha.isNotEmpty) {
      String os_tres =
          Nome +
          " " +
          CPF +
          " " +
          Tel +
          " " +
          Email +
          " " +
          Senha +
          " " +
          Conf_senha;
          if(Senha != Conf_senha){
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('As senhas inseridas não são iguais.')),
            );
            setState(() {
              _estaCarregando = false;
            });
            return;
          }

      await Supabase.instance.client.from('Notas').insert({
        'body': os_tres,
      });

      // Opcional: limpa os campos após o envio bem-sucedido
      _NomeController.clear();
      _CPFController.clear();
      _TelController.clear();
      _EmailController.clear();
      _SenhaController.clear();
      _ConSenhaController.clear();

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cadastro Realizado com sucesso!')),
      );
    }
    else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Preencha o(s) campo(s) em branco.')),
      );
    }
    setState(() {
      _estaCarregando = false;
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
              padding: EdgeInsets.fromLTRB(25, 50, 25, 50),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(30),
                  topRight: Radius.circular(30),
                ), // Rounds all corners by 20 pixels
              ),
              child: Column(
                spacing: 15,
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
                      SizedBox(
                        width: 350,
                        child: TextField(
                          controller: _NomeController,
                          obscureText: false,
                          decoration: InputDecoration(
                            border: OutlineInputBorder(),
                            labelText: 'Digite seu Nome',
                          ),
                        ),
                      ),
                    ],
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.max,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      SizedBox(
                        width: 350,
                        child: TextField(
                          controller: _CPFController,
                          obscureText: false,
                          decoration: InputDecoration(
                            border: OutlineInputBorder(),
                            labelText: 'Digite seu CPF',
                          ),
                        ),
                      ),
                    ],
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.max,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      SizedBox(
                        width: 350,
                        child: TextField(
                          controller: _TelController,
                          obscureText: false,
                          decoration: InputDecoration(
                            border: OutlineInputBorder(),
                            labelText: 'Número de telefone',
                          ),
                        ),
                      ),
                    ],
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.max,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      SizedBox(
                        width: 350,
                        child: TextField(
                          controller: _EmailController,
                          obscureText: false,
                          decoration: InputDecoration(
                            border: OutlineInputBorder(),
                            labelText: 'Digite seu E-mail',
                          ),
                        ),
                      ),
                    ],
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.max,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      SizedBox(
                        width: 350,
                        child: TextField(
                          controller: _SenhaController,
                          obscureText: true,
                          decoration: InputDecoration(
                            border: OutlineInputBorder(),
                            labelText: 'Digite sua senha',
                          ),
                        ),
                      ),
                    ],
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.max,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      SizedBox(
                        width: 350,
                        child: TextField(
                          controller: _ConSenhaController,
                          obscureText: true,
                          decoration: InputDecoration(
                            border: OutlineInputBorder(),
                            labelText: 'Confirme sua senha',
                          ),
                        ),
                      ),
                    ],
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.max,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      ElevatedButton(
                        onPressed: _estaCarregando ? null : _enviarDados,
                        child: _estaCarregando
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                ),
                              )
                            : const Text('Enviar'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Container(
              margin: EdgeInsets.fromLTRB(0, 0, 0, 150),
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
                contentPadding: const EdgeInsets.symmetric(horizontal: 30),
                children: [
                  TextFormField(
                    onFieldSubmitted: (value) async {
                      await Supabase.instance.client.from('Notas').insert({
                        'body': value,
                      });
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
