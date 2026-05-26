import 'dart:async';

import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';

class Maps_alertas extends StatefulWidget {
  const Maps_alertas({super.key});

  @override
  State<Maps_alertas> createState() => _MapsAlertas();
}

class _MapsAlertas extends State<Maps_alertas> {
  final Completer<GoogleMapController> _controller =
      Completer<GoogleMapController>();

  Future<void> _GoToUserLocation() async {
    await Permission.location.request();
    Position position = await Geolocator.getCurrentPosition();
    GoogleMapController controller = await _controller.future;
    controller.animateCamera(
      CameraUpdate.newLatLngZoom(
        LatLng(position.latitude, position.longitude),
        15,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          _GoToUserLocation();
        },
        child: Icon(Icons.my_location),
      ),
      body: SafeArea(
        child: GoogleMap(
          onMapCreated: (GoogleMapController controller) =>
              _controller.complete(controller),
          initialCameraPosition: CameraPosition(
            target: LatLng(-23.014336, -45.538053),
            zoom: 100,
          ),
        ),
      ),
    );
  }
}
