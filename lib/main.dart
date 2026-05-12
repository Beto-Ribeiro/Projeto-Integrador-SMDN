import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'dart:ui';

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
      home: const MyHomePage(
        title: 'SMDN Tela de Cadastro',
      ),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({
    super.key,
    required this.title,
  });

  final String title;

  @override
  State<MyHomePage> createState() =>
      _MyHomePageState();
}

class AbstractBackgroundPainter
    extends CustomPainter {

  @override
  void paint(Canvas canvas, Size size) {

    final double scaleX =
        size.width / 390;

    final double scaleY =
        size.height / 844;

    final Paint paint = Paint()
      ..style = PaintingStyle.fill
      ..maskFilter = const MaskFilter.blur(
        BlurStyle.normal,
        94.3,
      );

    void drawEllipse(
        double cx,
        double cy,
        double rx,
        double ry,
        Color color,
        ) {

      paint.color = color;

      canvas.drawOval(
        Rect.fromLTWH(
          (cx - rx) * scaleX,
          (cy - ry) * scaleY,
          (rx * 2) * scaleX,
          (ry * 2) * scaleY,
        ),
        paint,
      );
    }

    drawEllipse(
      34.5,
      73.5,
      83.5,
      78.5,
      const Color(0xFF09162E),
    );

    drawEllipse(
      315.5,
      52.5,
      142.5,
      153.5,
      const Color(0xFF44769B),
    );

    drawEllipse(
      199.5,
      235.5,
      119.5,
      120.5,
      const Color(0xFF18395C),
    );

    drawEllipse(
      258.5,
      406.0,
      115.5,
      104.0,
      const Color(0xFF09162E),
    );

    drawEllipse(
      24.0,
      272.5,
      108.0,
      106.5,
      const Color(0xFF44769B),
    );

    drawEllipse(
      118.0,
      600.0,
      96.0,
      86.0,
      const Color(0xFF09162E),
    );

    drawEllipse(
      196.5,
      507.5,
      94.5,
      93.0,
      const Color(0xFFA6C1D4),
    );

    drawEllipse(
      291.5,
      663.0,
      109.0,
      114.5,
      const Color(0xFF18395C),
    );

    drawEllipse(
      101.5,
      693.0,
      112.0,
      100.5,
      const Color(0xFFA6C1D4),
    );

    drawEllipse(
      355.5,
      820.5,
      125.5,
      123.5,
      const Color(0xFF44769B),
    );

    drawEllipse(
      145.5,
      166.5,
      80.5,
      79.5,
      const Color(0xFFA6C1D4),
    );
  }

  @override
  bool shouldRepaint(
      covariant CustomPainter oldDelegate,
      ) =>
      false;
}

class _MyHomePageState
    extends State<MyHomePage> {

  bool _estaCarregando = false;

  final _NomeController =
  TextEditingController();

  final _CPFController =
  TextEditingController();

  final _TelController =
  TextEditingController();

  final _EmailController =
  TextEditingController();

  final _SenhaController =
  TextEditingController();

  final _ConSenhaController =
  TextEditingController();

  Future<void> _enviarDados() async {

    setState(() {
      _estaCarregando = true;
    });

    try {

      String Nome =
      _NomeController.text.trim();

      String CPF =
      _CPFController.text.trim();

      String Tel =
      _TelController.text.trim();

      String Email =
      _EmailController.text.trim();

      String Senha =
      _SenhaController.text.trim();

      String Conf_senha =
      _ConSenhaController.text.trim();

      if (Nome.isEmpty ||
          CPF.isEmpty ||
          Tel.isEmpty ||
          Email.isEmpty ||
          Senha.isEmpty ||
          Conf_senha.isEmpty) {

        ScaffoldMessenger.of(context)
            .showSnackBar(
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

        ScaffoldMessenger.of(context)
            .showSnackBar(
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

      final authResponse =
      await Supabase.instance.client.auth.signUp(
        email: Email,
        password: Senha,

        data: {
          'prf_tipo': 'cidadao',
          'prf_nome': Nome,
          'cpf': CPF,
          'rg': (10000000 +
            (DateTime.now().millisecondsSinceEpoch % 90000000))
          .toString(),
          'data_nascimento': '2000-01-01',
        },
      );



      final user =
          authResponse.user;

      print(user);

      if (user == null) {

        ScaffoldMessenger.of(context)
            .showSnackBar(
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
      _TelController.clear();
      _EmailController.clear();
      _SenhaController.clear();
      _ConSenhaController.clear();

      ScaffoldMessenger.of(context)
          .showSnackBar(
        const SnackBar(
          content: Text(
            'Cadastro Realizado com sucesso!',
          ),
        ),
      );

    } catch (e) {

      print(e);

      ScaffoldMessenger.of(context)
          .showSnackBar(
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

  @override
  Widget build(BuildContext context) {

    return Scaffold(
      backgroundColor:
      Colors.blueGrey[600],

      body: Stack(
        children: [

          Positioned.fill(
            child: CustomPaint(
              painter:
              AbstractBackgroundPainter(),
            ),
          ),

          SafeArea(
            child: Column(
              verticalDirection:
              VerticalDirection.up,

              mainAxisSize:
              MainAxisSize.max,

              children: <Widget>[

                Container(
                  padding:
                  const EdgeInsets.fromLTRB(
                    25,
                    50,
                    25,
                    50,
                  ),

                  decoration: const BoxDecoration(
                    color: Colors.white,

                    borderRadius:
                    BorderRadius.only(
                      topLeft:
                      Radius.circular(30),

                      topRight:
                      Radius.circular(30),
                    ),
                  ),

                  child: Column(
                    spacing: 15,

                    children: <Widget>[

                      Text(
                        "Vamos Começar??",

                        style: TextStyle(
                          fontSize: 30,
                          fontWeight:
                          FontWeight.w700,
                          color:
                          Colors.blueGrey,
                        ),
                      ),

                      SizedBox(
                        width: 350,

                        child: TextField(
                          controller:
                          _NomeController,

                          decoration:
                          const InputDecoration(
                            border:
                            OutlineInputBorder(),

                            labelText:
                            'Digite seu Nome',
                          ),
                        ),
                      ),

                      SizedBox(
                        width: 350,

                        child: TextField(
                          controller:
                          _CPFController,

                          decoration:
                          const InputDecoration(
                            border:
                            OutlineInputBorder(),

                            labelText:
                            'Digite seu CPF',
                          ),
                        ),
                      ),

                      SizedBox(
                        width: 350,

                        child: TextField(
                          controller:
                          _TelController,

                          decoration:
                          const InputDecoration(
                            border:
                            OutlineInputBorder(),

                            labelText:
                            'Número de telefone',
                          ),
                        ),
                      ),

                      SizedBox(
                        width: 350,

                        child: TextField(
                          controller:
                          _EmailController,

                          decoration:
                          const InputDecoration(
                            border:
                            OutlineInputBorder(),

                            labelText:
                            'Digite seu E-mail',
                          ),
                        ),
                      ),

                      SizedBox(
                        width: 350,

                        child: TextField(
                          controller:
                          _SenhaController,

                          obscureText: true,

                          decoration:
                          const InputDecoration(
                            border:
                            OutlineInputBorder(),

                            labelText:
                            'Digite sua senha',
                          ),
                        ),
                      ),

                      SizedBox(
                        width: 350,

                        child: TextField(
                          controller:
                          _ConSenhaController,

                          obscureText: true,

                          decoration:
                          const InputDecoration(
                            border:
                            OutlineInputBorder(),

                            labelText:
                            'Confirme sua senha',
                          ),
                        ),
                      ),

                      ElevatedButton(
                        onPressed:
                        _estaCarregando
                            ? null
                            : _enviarDados,

                        child:
                        _estaCarregando
                            ? const SizedBox(
                          width: 20,
                          height: 20,
                          child:
                          CircularProgressIndicator(
                            strokeWidth:
                            2,
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
                  margin:
                  const EdgeInsets.fromLTRB(
                    0,
                    0,
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
        ],
      ),
    );
  }
}