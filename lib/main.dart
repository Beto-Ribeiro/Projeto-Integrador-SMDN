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

class AbstractBackgroundPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    // Escala para garantir que o desenho se ajuste ao tamanho da tela
    final double scaleX = size.width / 390;
    final double scaleY = size.height / 844;

    final Paint paint = Paint()
      ..style = PaintingStyle.fill
      // O stdDeviation de 94.3 do SVG equivale a esse MaskFilter no Flutter
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 94.3);

    void drawEllipse(double cx, double cy, double rx, double ry, Color color) {
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

    // Camadas de cores baseadas no seu SVG
    drawEllipse(34.5, 73.5, 83.5, 78.5, const Color(0xFF09162E));
    drawEllipse(315.5, 52.5, 142.5, 153.5, const Color(0xFF44769B));
    drawEllipse(199.5, 235.5, 119.5, 120.5, const Color(0xFF18395C));
    drawEllipse(258.5, 406.0, 115.5, 104.0, const Color(0xFF09162E));
    drawEllipse(24.0, 272.5, 108.0, 106.5, const Color(0xFF44769B));
    drawEllipse(118.0, 600.0, 96.0, 86.0, const Color(0xFF09162E));
    drawEllipse(196.5, 507.5, 94.5, 93.0, const Color(0xFFA6C1D4));
    drawEllipse(291.5, 663.0, 109.0, 114.5, const Color(0xFF18395C));
    drawEllipse(101.5, 693.0, 112.0, 100.5, const Color(0xFFA6C1D4));
    drawEllipse(355.5, 820.5, 125.5, 123.5, const Color(0xFF44769B));
    drawEllipse(145.5, 166.5, 80.5, 79.5, const Color(0xFFA6C1D4));
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
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

    if (Nome.isNotEmpty ||
        CPF.isNotEmpty ||
        Tel.isNotEmpty ||
        Email.isNotEmpty ||
        Senha.isNotEmpty ||
        Conf_senha.isNotEmpty) {

      if (Senha != Conf_senha) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('As senhas inseridas não são iguais.')),
        );
        setState(() {
          _estaCarregando = false;
        });
        return;
      }

      await Supabase.instance.client.from('Notas').insert({
        'nome': Nome,
        'CPF': CPF,
        'Tel': Tel,
        'email': Email,
        'senha': Senha,


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
    } else {
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
      body: Stack(
        children: [
          Positioned.fill(
            child: CustomPaint(
              painter: AbstractBackgroundPainter(),
            ),
          ),
          SafeArea(
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
                      Container(
                        height: 80,
                        width: double.infinity,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          mainAxisSize: MainAxisSize.max,
                          spacing: 80,
                          children: [
                            Column(
                              mainAxisSize: MainAxisSize.max,
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                ElevatedButton(
                                  style: IconButton.styleFrom(
                                    shape: const RoundedRectangleBorder(
                                      borderRadius: BorderRadius.all(
                                        Radius.circular(20),
                                      ),
                                    ),
                                    padding: EdgeInsets.all(18),
                                  ),
                                  onPressed: () {},
                                  child: Image.asset(
                                    fit: BoxFit.cover,
                                    'imagens/apple.png',
                                    height: 35,
                                  ),
                                ),
                              ],
                            ),
                            Column(
                              mainAxisSize: MainAxisSize.max,
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                ElevatedButton(
                                  style: IconButton.styleFrom(
                                    shape: const RoundedRectangleBorder(
                                      borderRadius: BorderRadius.all(
                                        Radius.circular(20),
                                      ),
                                    ),
                                    padding: EdgeInsets.all(18),
                                  ),
                                  onPressed: () {},
                                  child: Image.asset(
                                    fit: BoxFit.cover,
                                    'imagens/google_logo.png',
                                    height: 35,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  margin: EdgeInsets.fromLTRB(0, 0, 0, 80),
                  child: Image.asset(
                    "imagens/SMDN png.png",
                    height: 60,
                  ),
                ),

                /*Text(
                  style: TextStyle(
                    fontSize: 40,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                  "SMDN",
                ),*/
              ],
            ),
          ),
        ],
      ),
    );
  }
}
