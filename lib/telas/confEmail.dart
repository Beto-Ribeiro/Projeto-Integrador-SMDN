import 'package:branch1/telas/cadastro_tela.dart';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'exportador_import.dart';
import 'package:branch1/main.dart';

class confEmail extends StatefulWidget {
  final Function(int) onChangePage;
  final String? email;
  final String? senha;


  const confEmail({
    super.key,
    required this.title,
    required this.email,
    required this.senha,
    required this.onChangePage,
  });

  final String title;

  @override
  State<confEmail> createState() => _confEmail_state();
}

class _confEmail_state extends State<confEmail> {

  Future<void> verificarConfirmacao() async {
    print("Clicou em Já confirmei");
    print("EMAIL: ${widget.email}");
    print("SENHA: ${widget.senha}");
    if (widget.email == null || widget.senha == null) return;

    try {
      final response = await Supabase.instance.client.auth.signInWithPassword(
        email: widget.email!,
        password: widget.senha!,
      );

      if (response.session != null) {
        widget.onChangePage(0);
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("E-mail ainda não confirmado."),
        ),
      );
    }
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
            child: Container(
              constraints: BoxConstraints(
                minHeight: MediaQuery.of(context).size.height,
              ),
              child: Column(
                verticalDirection: VerticalDirection.up,

                mainAxisSize: MainAxisSize.max,

                children: <Widget>[
                  Container(
                    padding: const EdgeInsets.fromLTRB(
                      25,
                      25,
                      25,
                      25,
                    ),
                    width: double.infinity,
                    height: 300,
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.only(
                        topLeft: Radius.circular(30),
                        topRight: Radius.circular(30),
                      ),
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.max,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          spacing: 35,
                          children: <Widget>[
                            Text("Confirme seu e-mail de cadastro", style: TextStyle(fontSize: 20, fontWeight: FontWeight(900)),)
                          ],
                        ),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          spacing: 35,
                          children: <Widget>[
                            Text("para prosseguir", style: TextStyle(fontSize: 20, fontWeight: FontWeight(900)),)
                          ],
                        ),
                        Container(
                          height: 30,
                          width: double.infinity,
                        ),
                        ElevatedButton(onPressed: verificarConfirmacao, child: Text("Já confirmei!"))
                      ],
                    ),
                  ),
                  Container(
                    margin: const EdgeInsets.fromLTRB(
                      0,
                      80,
                      0,
                      350,
                    ),

                    child: Image.asset(
                      "gfx/png/Image/SMDN.png",
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
