import 'package:branch1/telas/cadastro_tela.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'exportador_import.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';

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

Future<void> _Ask_for_permission() async {
  PermissionStatus status = await Permission.location.request();

  if (status.isGranted) {
    Position position = await Geolocator.getCurrentPosition();
  } else if (status.isDenied || status.isPermanentlyDenied) {
    debugPrint('Permissão de localização negada pelo usuário.');
  }
}

Future<void> Criar_SOS(
    BuildContext context, {
      required String usuarioId,
      required String localizacao,
      required String data,
      required String origem,
    }) async {
  final supabase = Supabase.instance.client;

  await _Ask_for_permission();

  Position posicao = await Geolocator.getCurrentPosition(
    locationSettings: const LocationSettings(
      accuracy: LocationAccuracy.high,
    ),
  );

  final String pontoGeografico =
      'POINT(${posicao.longitude} ${posicao.latitude})';

  try {
    await supabase.from('Relato').insert({
      'rel_cid_id': usuarioId,
      'rel_tipo_desastre': "SOS",
      'rel_descricao': "Auxílio",
      'rel_localizacao': localizacao,
      'rel_data_hora': data,
    });

    mostrarRelatoEnviado(context);
  } catch (e) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Erro'),
        duration: Duration(seconds: 3),
      ),
    );
  }
}

void mostrarRelatoEnviado(BuildContext context) {
  showDialog(
    context: context,
    builder: (context) => AlertDialog(
      title: const Text('Sucesso'),
      content: const Text(
        'Ocorrência reportada com sucesso. As autoridades estão a caminho.',
      ),
      actions: [
        TextButton(
          onPressed: () {
            Navigator.pop(context);
          },
          child: const Text('OK'),
        ),
      ],
    ),
  );
}

class _Home_State extends State<Home> {
  bool _sosEnviado = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Stack(
          children: [
            Container(
              width: double.infinity,
              height: double.infinity,
              decoration: const BoxDecoration(),
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
                          // ── Título principal animado ──────────────────────
                          AnimatedSwitcher(
                            duration: const Duration(milliseconds: 500),
                            transitionBuilder: (child, animation) {
                              return FadeTransition(
                                opacity: animation,
                                child: SlideTransition(
                                  position: Tween<Offset>(
                                    begin: const Offset(0, -0.2),
                                    end: Offset.zero,
                                  ).animate(animation),
                                  child: child,
                                ),
                              );
                            },
                            child: _sosEnviado
                                ? Container(
                              key: const ValueKey('enviado'),
                              width: double.infinity,
                              alignment: Alignment.center,
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 16),
                              child: const Text(
                                "Auxílio solicitado!",
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 34,
                                  fontWeight: FontWeight.bold,
                                  color: Color.fromRGBO(9, 22, 46, 1),
                                ),
                              ),
                            )
                                : Column(
                              key: const ValueKey('inicial'),
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
                              ],
                            ),
                          ),

                          // ── Subtítulo animado ─────────────────────────────
                          AnimatedSwitcher(
                            duration: const Duration(milliseconds: 400),
                            child: _sosEnviado
                                ? Container(
                              key: const ValueKey('subEnviado'),
                              width: double.infinity,
                              alignment: Alignment.center,
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 24),
                              child: const Text(
                                "As autoridades estão a caminho",
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 18,
                                  color: Color.fromRGBO(68, 118, 155, 1),
                                ),
                              ),
                            )
                                : Container(
                              key: const ValueKey('subInicial'),
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
                          ),

                          const SizedBox(height: 20),

                          // ── Botão SOS ─────────────────────────────────────
                          AbsorbPointer(
                            absorbing: _sosEnviado,
                            child: InkWell(
                              borderRadius: BorderRadius.circular(150),
                              onTap: _sosEnviado
                                  ? null
                                  : () async {
                                Position posicao =
                                await Geolocator.getCurrentPosition(
                                  locationSettings: const LocationSettings(
                                    accuracy: LocationAccuracy.high,
                                  ),
                                );

                                final String pontoGeografico =
                                    'POINT(${posicao.longitude} ${posicao.latitude})';

                                await Criar_SOS(
                                  context,
                                  usuarioId: Supabase
                                      .instance.client.auth.currentUser!.id,
                                  localizacao: pontoGeografico,
                                  data: DateTime.now().toIso8601String(),
                                  origem: 'SOS',
                                );

                                // Atualiza estado para animar e desabilitar
                                setState(() {
                                  _sosEnviado = true;
                                });
                              },
                              child: Stack(
                                alignment: Alignment.center,
                                children: [
                                  // Anel externo
                                  AnimatedContainer(
                                    duration: const Duration(milliseconds: 600),
                                    curve: Curves.easeInOut,
                                    width: 300,
                                    height: 300,
                                    decoration: BoxDecoration(
                                      color: _sosEnviado
                                          ? const Color.fromRGBO(
                                          80, 80, 80, 0.4)
                                          : const Color.fromRGBO(
                                          200, 0, 0, 0.5),
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                  // Círculo interno
                                  AnimatedContainer(
                                    duration: const Duration(milliseconds: 600),
                                    curve: Curves.easeInOut,
                                    width: 275,
                                    height: 275,
                                    decoration: BoxDecoration(
                                      color: _sosEnviado
                                          ? const Color.fromRGBO(
                                          100, 100, 100, 1)
                                          : const Color.fromRGBO(225, 0, 0, 1),
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                  SvgPicture.asset(
                                    'gfx/svg/icons/btn_alert.svg',
                                    width: 225,
                                    colorFilter: _sosEnviado
                                        ? const ColorFilter.mode(
                                      Color.fromRGBO(180, 180, 180, 1),
                                      BlendMode.srcIn,
                                    )
                                        : null,
                                  ),
                                ],
                              ),
                            ),
                          ),

                          const SizedBox(height: 130, width: double.infinity),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            ContainerPerfilSuperior(onChangePage: widget.onChangePage),
          ],
        ),
      ),
    );
  }
}