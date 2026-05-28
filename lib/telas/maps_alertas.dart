import 'dart:async';

import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import 'exportador_import.dart';

class Maps_alertas extends StatefulWidget {
  final Function(int) onChangePage;
  const Maps_alertas({
    super.key,
    required this.title,
    required this.onChangePage,
  });

  final String title;

  @override
  State<Maps_alertas> createState() => _MapsAlertas();
}

class _MapsAlertas extends State<Maps_alertas> {
  final Completer<GoogleMapController> _controller =
      Completer<GoogleMapController>();
  final Color corFundoMenu = const Color(0xFF0B1426);

  @override
  void initState() {
    super.initState();
    _GoToUserLocation(); // Chama a função de localização logo na entrada
  }

  Future<void> _GoToUserLocation() async {
    // Solicita a permissão. Se o usuário já tiver aceitado antes, ele pula direto.
    PermissionStatus status = await Permission.location.request();

    if (status.isGranted) {
      // Pega as coordenadas atuais do GPS
      Position position = await Geolocator.getCurrentPosition();

      // Aguarda o mapa ser criado e estar pronto
      GoogleMapController controller = await _controller.future;

      // Move a câmera suavemente para a localização do usuário
      controller.animateCamera(
        CameraUpdate.newLatLngZoom(
          LatLng(position.latitude, position.longitude),
          15, // Nível de zoom ideal
        ),
      );
    } else if (status.isDenied || status.isPermanentlyDenied) {
      debugPrint('Permissão de localização negada pelo usuário.');
      // Opcional: Você pode exibir um aviso na tela se quiser
    }
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Stack(
        children: [
          // 1. O Mapa ao fundo preenchendo toda a área
          GoogleMap(
            onMapCreated: (GoogleMapController controller) =>
                _controller.complete(controller),
            myLocationEnabled: true,
            myLocationButtonEnabled: false, // Esconde o botão padrão do Google
            initialCameraPosition: const CameraPosition(
              target: LatLng(-23.014336, -45.538053),
              zoom: 15,
            ),
          ),

          // 2. O botão de focar na localização atual sobre o mapa
          // 2. O botão de focar na localização atual
          Positioned(
            bottom: 100,
            // Se quiser mesmo no canto ESQUERDO, troque 'right: 16' por 'left: 16'
            right: 16,
            child: FloatingActionButton(
              heroTag: "btnLocalizacaoMapaUnico",
              backgroundColor: corFundoMenu,
              // Usa a cor azul escuro do menu
              elevation: 4,
              // Uma leve sombra para destacar do mapa
              shape: const CircleBorder(),
              // Força o formato perfeitamente redondo do Material 3
              onPressed: _GoToUserLocation,
              child: const Icon(
                Icons.my_location,
                color: Colors.white,
              ), // Ícone branco
            ),
          ),
          ContainerPerfilSuperior(
            onChangePage: widget.onChangePage,
          ),
        ],
      ),
    );
  }
}
