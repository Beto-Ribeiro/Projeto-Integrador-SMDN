import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'controle_acessibilidade.dart';

class BotaoAcessibilidade extends StatefulWidget {
  const BotaoAcessibilidade({super.key});

  @override
  State<BotaoAcessibilidade> createState() => _BotaoAcessibilidadeState();
}

class _BotaoAcessibilidadeState extends State<BotaoAcessibilidade>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _abrirPainel() async {
    // Gira a engrenagem uma volta completa ao abrir
    _controller.forward(from: 0);

    final acessibilidade = context.read<AccessibilityController>();

    await showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return ListenableBuilder(
          listenable: acessibilidade,
          builder: (context, _) {
            return Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Acessibilidade',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'As opções abaixo se aplicam a todas as telas do app.',
                    style: TextStyle(fontSize: 13, color: Colors.grey),
                  ),
                  const SizedBox(height: 12),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Letras grandes'),
                    subtitle: const Text('Aumenta o tamanho do texto'),
                    value: acessibilidade.letrasGrandes,
                    onChanged: (_) => acessibilidade.toggleLetrasGrandes(),
                  ),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Alto contraste'),
                    subtitle: const Text('Cores com maior contraste'),
                    value: acessibilidade.altoContraste,
                    onChanged: (_) => acessibilidade.toggleAltoContraste(),
                  ),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Modo daltonismo'),
                    subtitle: const Text('Paleta de cores adaptada'),
                    value: acessibilidade.daltonismo,
                    onChanged: (_) => acessibilidade.toggleDaltonismo(),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Positioned(
      top: 16,
      right: 16,
      child: Material(
        color: Theme.of(context).colorScheme.primary,
        shape: const CircleBorder(),
        elevation: 4,
        child: InkWell(
          customBorder: const CircleBorder(),
          onTap: _abrirPainel,
          child: Padding(
            padding: const EdgeInsets.all(10),
            child: RotationTransition(
              turns: _controller,
              child: Icon(
                Icons.settings,
                color: Theme.of(context).colorScheme.onPrimary,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
