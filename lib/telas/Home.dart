import 'package:branch1/telas/cadastro_tela.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'exportador_import.dart';
import 'tela_sobrevivencia.dart';

class Home extends StatefulWidget {
  final Function(int) onChangePage;
  const Home({
    super.key,
    required this.title,
    required this.onChangePage,
  });

  final String title;

  @override
  State<Home> createState() => _Home_State();
}

class _Home_State extends State<Home> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFE9EDF0),
      body: SafeArea(
        child: Stack(
          children: [
            Container(
              width: double.infinity,
              height: double.infinity,
              child: Column(
                mainAxisSize: MainAxisSize.max,
                verticalDirection: VerticalDirection.up,
                children: [
                  SingleChildScrollView(
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.fromLTRB(0, 30, 0, 0),
                      child: Column(
                        children: [
                          Container(
                            width: double.infinity,
                            alignment: Alignment.center,
                            child: const Text(
                              "Precisa de ajuda de",
                              style: TextStyle(
                                fontSize: 34,
                                fontWeight: FontWeight.bold,
                                color: Color.fromRGBO(9, 22, 46, 1),
                              ),
                            ),
                          ),
                          Container(
                            width: double.infinity,
                            alignment: Alignment.center,
                            child: const Text(
                              "emergência?",
                              style: TextStyle(
                                fontSize: 34,
                                fontWeight: FontWeight.bold,
                                color: Color.fromRGBO(9, 22, 46, 1),
                              ),
                            ),
                          ),
                          Container(
                            width: double.infinity,
                            alignment: Alignment.center,
                            child: const Text(
                              "Pressione o botão abaixo para acioná-la",
                              style: TextStyle(
                                fontSize: 18,
                                color: Color.fromRGBO(68, 118, 155, 1),
                              ),
                            ),
                          ),
                          const SizedBox(height: 30),

                          // Botão de Alerta (Sino)
                          InkWell(
                            borderRadius: BorderRadius.circular(150),
                            onTap: () {
                              // Ação do botão de emergência
                            },
                            child: Stack(
                              alignment: Alignment.center,
                              children: [
                                Container(
                                  width: 300,
                                  height: 300,
                                  decoration: const BoxDecoration(
                                    color: Color.fromRGBO(200, 0, 0, 0.3),
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                Container(
                                  width: 260,
                                  height: 260,
                                  decoration: const BoxDecoration(
                                    color: Color.fromRGBO(200, 0, 0, 1),
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const Icon(
                                  Icons.notifications_active,
                                  size: 130,
                                  color: Color(0xFF09162E),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 40),

                          // BOTÃO DO GUIA DE SOBREVIVÊNCIA
                          // BOTÃO DO GUIA DE SOBREVIVÊNCIA
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 30),
                            child: SizedBox(
                              width: double.infinity,
                              height: 55,
                              child: TextButton(
                                onPressed: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute( // <-- CERTIFIQUE-SE DE QUE NÃO HÁ "const" AQUI ANTES!
                                      builder: (context) => TelaSobrevivencia(), // Sem const aqui também!
                                    ),
                                  );
                                },
                                style: TextButton.styleFrom(
                                  backgroundColor: const Color(0xFF09162E),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(30),
                                  ),
                                ),
                                child: const Text(
                                  'Acesse o Guia de Sobrevivência',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 18,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 130),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            ContainerPerfilSuperior(onChangePage: widget.onChangePage,),
          ],
        ),
      ),
    );
  }
}