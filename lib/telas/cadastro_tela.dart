import 'package:branch1/telas/cadastro_tela.dart';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'exportador_import.dart';

class Cadastro_tela extends StatefulWidget {
  const Cadastro_tela({
    super.key,
    required this.title,
  });

  final String title;

  @override
  State<Cadastro_tela> createState() => _Cadastro_telaState();
}

class _Cadastro_telaState extends State<Cadastro_tela> {
  bool _estaCarregando = false;

  final _NomeController = TextEditingController();

  final _CPFController = TextEditingController();

  final _RgController = TextEditingController();

  final _TelController = TextEditingController();

  final _EmailController = TextEditingController();

  final _SenhaController = TextEditingController();

  final _ConSenhaController = TextEditingController();

  Future<void> _enviarDados() async {
    setState(() {
      _estaCarregando = true;
    });

    try {
      String Nome = _NomeController.text.trim();

      String CPF = _CPFController.text.trim();

      String RG = _RgController.text.trim();

      String Tel = _TelController.text.trim();

      String Email = _EmailController.text.trim();

      String Data = _dateTime.toString();

      String Senha = _SenhaController.text.trim();

      String Conf_senha = _ConSenhaController.text.trim();

      if (Nome.isEmpty ||
          CPF.isEmpty ||
          RG.isEmpty ||
          Tel.isEmpty ||
          Email.isEmpty ||
          Data.isEmpty ||
          Senha.isEmpty ||
          Conf_senha.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Preencha todos os campos.',
            ),
          ),
        );

        setState(() {
          _estaCarregando = false;
        });

        return;
      }

      if (Senha != Conf_senha) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'As senhas inseridas não são iguais.',
            ),
          ),
        );

        setState(() {
          _estaCarregando = false;
        });

        return;
      }

      final authResponse = await Supabase.instance.client.auth.signUp(
        email: Email,
        password: Senha,

        data: {
          'prf_tipo': 'cidadao',
          'prf_nome': Nome,
          'cpf': CPF,
          'rg': RG,
          'data_nascimento': Data,
        },
      );

      final user = authResponse.user;

      print(user);

      if (user == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Usuário não autenticado.',
            ),
          ),
        );

        setState(() {
          _estaCarregando = false;
        });

        return;
      }

      _NomeController.clear();
      _CPFController.clear();
      _RgController.clear();
      _TelController.clear();
      _EmailController.clear();
      _SenhaController.clear();
      _ConSenhaController.clear();

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Cadastro Realizado com sucesso!',
          ),
        ),
      );
    } catch (e) {
      print(e);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            e.toString(),
          ),
        ),
      );
    }

    setState(() {
      _estaCarregando = false;
    });
  }

  void _showDatePicker() {
    showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(1909),
      lastDate: DateTime.now(),
    ).then((value) {
      if (value != null) {
        setState(() {
          _dateTime = value;
        });
      }
    });
  }

  DateTime _dateTime = DateTime(0);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.blueGrey[600],

      body: Stack(
        children: [
          Positioned.fill(
            child: CustomPaint(
              painter: AbstractBackgroundPainter(),
            ),
          ),

          SafeArea(
            child: SingleChildScrollView(
              child: Column(
                verticalDirection: VerticalDirection.up,

                mainAxisSize: MainAxisSize.max,

                children: <Widget>[
                  Container(
                    padding: const EdgeInsets.fromLTRB(
                      25,
                      50,
                      25,
                      50,
                    ),
                    width: double.infinity,
                    decoration: const BoxDecoration(
                      color: Colors.white,

                      borderRadius: BorderRadius.only(
                        topLeft: Radius.circular(30),

                        topRight: Radius.circular(30),
                      ),
                    ),

                    child: Column(
                      spacing: 15,

                      children: <Widget>[
                        Text(
                          "Vamos Começar??",

                          style: TextStyle(
                            fontSize: 30,
                            fontWeight: FontWeight.w700,
                            color: Colors.blueGrey,
                          ),
                        ),

                        SizedBox(
                          width: 350,

                          child: TextField(
                            controller: _NomeController,

                            decoration: const InputDecoration(
                              border: OutlineInputBorder(),

                              labelText: 'Digite seu Nome',
                            ),
                          ),
                        ),

                        SizedBox(
                          width: 350,

                          child: TextField(
                            controller: _CPFController,

                            decoration: const InputDecoration(
                              border: OutlineInputBorder(),

                              labelText: 'Digite seu CPF',
                            ),
                          ),
                        ),

                        SizedBox(
                          width: 350,

                          child: TextField(
                            controller: _RgController,

                            decoration: const InputDecoration(
                              border: OutlineInputBorder(),

                              labelText: 'Digite seu RG',
                            ),
                          ),
                        ),

                        SizedBox(
                          width: 350,

                          child: TextField(
                            controller: _TelController,

                            decoration: const InputDecoration(
                              border: OutlineInputBorder(),

                              labelText: 'Número de telefone',
                            ),
                          ),
                        ),

                        SizedBox(
                          width: 350,

                          child: TextField(
                            controller: _EmailController,

                            decoration: const InputDecoration(
                              border: OutlineInputBorder(),

                              labelText: 'Digite seu E-mail',
                            ),
                          ),
                        ),
                        Text('Insira sua data de nascimento'),
                        Row(
                          spacing: 10,
                          mainAxisSize: MainAxisSize.max,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            ElevatedButton(
                              onPressed: _estaCarregando
                                  ? null
                                  : _showDatePicker,

                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.blueGrey,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(5),
                                ),
                                minimumSize: Size(30, 40),
                              ),

                              child: Icon(
                                Icons.calendar_month,
                                color: Colors.white,
                              ),
                            ),
                            Container(
                              width: 250,
                              height: 40,
                              decoration: BoxDecoration(
                                color: Colors.blueGrey[100],
                                borderRadius: BorderRadius.circular(5),
                              ),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                mainAxisSize: MainAxisSize.max,

                                children: [
                                  Text(
                                    _dateTime.day.toString() + "/" +
                                    _dateTime.month.toString() + "/" +
                                    _dateTime.year.toString(),
                                    style: TextStyle(color: Colors.black),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        SizedBox(
                          width: 350,

                          child: TextField(
                            controller: _SenhaController,

                            obscureText: true,

                            decoration: const InputDecoration(
                              border: OutlineInputBorder(),

                              labelText: 'Digite sua senha',
                            ),
                          ),
                        ),

                        SizedBox(
                          width: 350,

                          child: TextField(
                            controller: _ConSenhaController,

                            obscureText: true,

                            decoration: const InputDecoration(
                              border: OutlineInputBorder(),

                              labelText: 'Confirme sua senha',
                            ),
                          ),
                        ),

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
                              : const Text(
                            'Enviar',
                          ),
                        ),
                      ],

                    ),
                  ),

                  Container(
                    margin: const EdgeInsets.fromLTRB(
                      0,
                      80,
                      0,
                      80,
                    ),

                    child: Image.asset(
                      "imagens/SMDN png.png",
                      height: 60,
                    ),
                  ),

                ],

              ),
            ),
          ),
        ],
      ),
    );
  }
}