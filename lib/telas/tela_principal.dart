import 'package:branch1/telas/Relatos.dart';
import 'package:branch1/telas/login_tela.dart';
import 'package:flutter/material.dart';
import 'exportador_import.dart'; // Importa a tela do mapa


class TelaPrincipal extends StatefulWidget {
  const TelaPrincipal({super.key});

  @override
  State<TelaPrincipal> createState() => _TelaPrincipalState();
}

class _TelaPrincipalState extends State<TelaPrincipal> {
  // Inicia no índice 1 para abrir o Mapa logo de cara
  bool estalogado = false;

  int _currentIndex =
  Supabase.instance.client.auth.currentUser == null
      ? 5
      : 0;

  void changePage(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  String? emailCadastro;
  String? senhaCadastro;

  // Definição das 4 páginas correspondentes aos ícones


  // Os ícones na exata ordem do design
  final List<IconData> _icones = [
    Icons.warning_amber_rounded,
    Icons.location_on_outlined,
    Icons.flag_outlined,
    Icons.cloud_queue,
  ];

  @override
  Widget build(BuildContext context) {

    final List<Widget> _telas = [
      Home(title: "SOS", onChangePage: changePage),
      Maps_alertas(title:"SOS", onChangePage: changePage,), // O MAPA É A SEGUNDA PÁGINA (Índice 1)
      Relatos_tela(title: "Relato", onChangePage: changePage),
      Scaffold(body: Center(child: Text('Página: Clima', style: TextStyle(fontSize: 24)))),
      Cadastro_tela(title: "Cadastro", onChangePage: changePage, onCadastroPendente: (email, senha){
        print("RECEBI EMAIL NA TELA PRINCIPAL: $email");
        print("RECEBI SENHA NA TELA PRINCIPAL: $senha");
        setState(() {
        emailCadastro = email;
        senhaCadastro = senha;
        _currentIndex = 6;
      });},),
      sLogCad(title: "Landing Page", onChangePage: changePage),
      confEmail(title: "Confirmação", onChangePage: changePage, email: emailCadastro, senha: senhaCadastro,),
      sLogin(title: "Login", onChangePage: changePage),
    ];


    final user = Supabase.instance.client.auth.currentUser;

    return Scaffold(
      extendBody: true, // Garante que o mapa passe por trás da barra transparente
      body: _telas[_currentIndex],
      bottomNavigationBar: (_currentIndex == 4 || _currentIndex == 5 || _currentIndex == 6 || _currentIndex == 7)
          ? null
          :CustomAnimatedBottomBar(
        currentIndex: _currentIndex,
        icones: _icones,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
      ),
    );
  }
}

// ============================================================================
// WIDGET CUSTOMIZADO: BARRA INFERIOR ANIMADA
// ============================================================================
class CustomAnimatedBottomBar extends StatelessWidget {
  final int currentIndex;
  final List<IconData> icones;
  final Function(int) onTap;

  const CustomAnimatedBottomBar({
    super.key,
    required this.currentIndex,
    required this.icones,
    required this.onTap,
  });

  final Color corFundoMenu = const Color(0xFF0B1426);
  final Color corIconeInativo = const Color(0xFF4A5568);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 90,
      child: TweenAnimationBuilder<double>(
        tween: Tween<double>(begin: currentIndex.toDouble(), end: currentIndex.toDouble()),
        duration: const Duration(milliseconds: 350),
        curve: Curves.easeInOutBack,
        builder: (context, value, child) {
          final double segmentWidth = MediaQuery.of(context).size.width / icones.length;
          final double buttonLeftOffset = (segmentWidth * value) + (segmentWidth / 2) - 28;

          return Stack(
            children: [
              Positioned(
                bottom: 0, left: 0, right: 0,
                child: ClipPath(
                  clipper: MenuClipper(value, icones.length),
                  child: Container(
                    height: 70,
                    color: corFundoMenu,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: List.generate(icones.length, (index) {
                        return GestureDetector(
                          behavior: HitTestBehavior.opaque,
                          onTap: () => onTap(index),
                          child: SizedBox(
                            width: segmentWidth,
                            height: 70,
                            child: Icon(
                              icones[index],
                              color: currentIndex == index ? Colors.transparent : corIconeInativo,
                              size: 28,
                            ),
                          ),
                        );
                      }),
                    ),
                  ),
                ),
              ),
              Positioned(
                top: 0,
                left: buttonLeftOffset,
                child: GestureDetector(
                  onTap: () => onTap(currentIndex),
                  child: Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: corFundoMenu,
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 3.5),
                    ),
                    child: Icon(icones[currentIndex], color: Colors.white, size: 28),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

// ============================================================================
// MATEMÁTICA DO RECORTE (NOTCH)
// ============================================================================
class MenuClipper extends CustomClipper<Path> {
  final double position;
  final int segments;

  MenuClipper(this.position, this.segments);

  @override
  Path getClip(Size size) {
    final path = Path();
    final double width = size.width;
    final double height = size.height;

    final double segmentWidth = width / segments;
    final double notchCenter = (segmentWidth * position) + (segmentWidth / 2);

    path.lineTo(notchCenter - 45, 0);
    path.cubicTo(notchCenter - 20, 0, notchCenter - 30, 45, notchCenter, 45);
    path.cubicTo(notchCenter + 30, 45, notchCenter + 20, 0, notchCenter + 45, 0);
    path.lineTo(width, 0);
    path.lineTo(width, height);
    path.lineTo(0, height);
    path.close();

    return path;
  }

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => true;
}