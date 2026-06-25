import 'package:branch1/telas/Relatos.dart';
import 'package:flutter/material.dart';
import 'exportador_import.dart';

class TelaPrincipal extends StatefulWidget {
  const TelaPrincipal({super.key});

  @override
  State<TelaPrincipal> createState() => _TelaPrincipalState();
}

class _TelaPrincipalState extends State<TelaPrincipal>
    with SingleTickerProviderStateMixin {
  int _currentIndex = 0;
  late AnimationController _nimboAnimController;
  late Animation<double> _nimboScaleAnim;

  void changePage(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  void initState() {
    super.initState();
    _nimboAnimController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 180),
      lowerBound: 0.0,
      upperBound: 1.0,
    )..value = 1.0;
    _nimboScaleAnim = CurvedAnimation(
      parent: _nimboAnimController,
      curve: Curves.easeOutBack,
    );
  }

  @override
  void dispose() {
    _nimboAnimController.dispose();
    super.dispose();
  }

  late final List<Widget> _telas = [
    Home(title: "SOS", onChangePage: changePage),                         // 0
    Maps_alertas(title: "SOS", onChangePage: changePage),                 // 1 — Mapa
    Relatos_tela(title: "Relato", onChangePage: changePage),              // 2
    Scaffold(body: Center(child: Text('Página: Clima', style: TextStyle(fontSize: 24)))), // 3 — placeholder
    ChatbotTela(title: 'Nimbo', onChangePage: changePage),                // 4 — Chatbot IA
    Cadastro_tela(title: "Cadastro", onChangePage: changePage),           // 5 — oculta nav
  ];

  // Somente os 4 ícones principais — Nimbo fica como botão flutuante
  final List<IconData> _icones = [
    Icons.warning_amber_rounded,
    Icons.location_on_outlined,
    Icons.flag_outlined,
    Icons.cloud_queue,
  ];

  @override
  Widget build(BuildContext context) {
    final bool mostrarNav = _currentIndex != 5;

    return Scaffold(
      extendBody: true,
      body: Stack(
        children: [
          // ── Conteúdo principal ───────────────────────────────────────────
          _telas[_currentIndex],

          // ── Botão Nimbo flutuante (acima da nav, canto inferior direito) ─
          // Oculta quando já estamos na página do chatbot (índice 4)
          if (mostrarNav && _currentIndex != 4)
            Positioned(
              bottom: 78, // fica logo acima da nav bar (altura 70)
              right: 20,
              child: ScaleTransition(
                scale: _nimboScaleAnim,
                child: GestureDetector(
                  onTapDown: (_) => _nimboAnimController.reverse(),
                  onTapUp: (_) {
                    _nimboAnimController.forward();
                    setState(() => _currentIndex = 4);
                  },
                  onTapCancel: () => _nimboAnimController.forward(),
                  child: Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      color: const Color(0xFF0B1426),
                      borderRadius: const BorderRadius.only(
                        topLeft: Radius.circular(32),
                        topRight: Radius.circular(32),
                        bottomLeft: Radius.circular(32),
                        bottomRight: Radius.circular(4),
                      ),
                      border: Border.all(
                        color: Colors.white.withOpacity(0.15),
                        width: 2,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.35),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(8),
                      child: Image.asset(
                        'gfx/png/Image/nimbo_icon.png',
                        fit: BoxFit.contain,
                        isAntiAlias: true,
                      ),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
      bottomNavigationBar: mostrarNav
          ? CustomAnimatedBottomBar(
              currentIndex: _currentIndex < 4 ? _currentIndex : -1,
              icones: _icones,
              onTap: (index) {
                setState(() {
                  _currentIndex = index;
                });
              },
            )
          : null,
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
        tween: Tween<double>(
          // Quando nenhum item está seleccionado (currentIndex < 0), move o
          // notch para fora do ecrã (posição -1) para não tapar nenhum ícone.
          begin: currentIndex < 0 ? -1.0 : currentIndex.toDouble(),
          end: currentIndex < 0 ? -1.0 : currentIndex.toDouble(),
        ),
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
                              color: currentIndex == index ? Colors.transparent : corIconeInativo.withOpacity(currentIndex < 0 ? 1.0 : 1.0),
                              size: 28,
                            ),
                          ),
                        );
                      }),
                    ),
                  ),
                ),
              ),
              if (currentIndex >= 0)
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