import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:geolocator/geolocator.dart';
import 'package:provider/provider.dart';
import 'exportador_import.dart';
import '../controles/controle_acessibilidade.dart';

class ClimaTela extends StatefulWidget {
  const ClimaTela({super.key});

  @override
  State<ClimaTela> createState() => _ClimaTelaState();
}

class _ClimaTelaState extends State<ClimaTela> {
  final TextEditingController cidadeController = TextEditingController();

  String cidade = "";
  String temperatura = "";
  String descricao = "";
  bool buscouClima = false;

  final String apiKey = "b5ead541b23bfa3331c7cf3de0678295";

  Future<void> buscarClima() async {
    if (cidade.trim().isEmpty) return;

    final url =
        "https://api.openweathermap.org/data/2.5/weather?q=${Uri.encodeComponent(cidade)}&appid=$apiKey&units=metric&lang=pt_br";

    final response = await http.get(Uri.parse(url));

    if (response.statusCode == 200) {
      final dados = jsonDecode(response.body);

      setState(() {
        cidade = dados["name"];
        temperatura = "${dados["main"]["temp"].round()}°";
        descricao = dados["weather"][0]["description"];
        buscouClima = true;
      });
    } else {
      setState(() {
        temperatura = "--°";
        descricao = "Cidade não encontrada";
        buscouClima = true;
      });
    }
  }

  Future<void> buscarClimaPorLocalizacao() async {
    try {
      bool serviceEnabled;
      LocationPermission permission;

      serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        _mostrarErro("Serviço de localização desativado");
        return;
      }

      permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          _mostrarErro("Permissão de localização negada");
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        _mostrarErro("Permissão permanentemente negada");
        return;
      }

      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      final url =
          "https://api.openweathermap.org/data/2.5/weather?lat=${position.latitude}&lon=${position.longitude}&appid=$apiKey&units=metric&lang=pt_br";

      final response = await http.get(Uri.parse(url));

      if (response.statusCode == 200) {
        final dados = jsonDecode(response.body);
        setState(() {
          cidade = dados["name"];
          temperatura = "${dados["main"]["temp"].round()}°";
          descricao = dados["weather"][0]["description"];
          buscouClima = true;
          cidadeController.text = cidade;
        });
      } else {
        _mostrarErro("Erro ao buscar clima da localização");
      }
    } catch (e) {
      _mostrarErro("Erro ao obter a localização");
    }
  }

  void _mostrarErro(String mensagem) {
    setState(() {
      cidade = "";
      temperatura = "--°";
      descricao = mensagem;
      buscouClima = true;
    });
  }

  @override
  void initState() {
    super.initState();
    buscarClimaPorLocalizacao();
  }

  @override
  Widget build(BuildContext context) {
    final acessibilidade = context.watch<AccessibilityController>();

    return Scaffold(
      backgroundColor: acessibilidade.fundo,

      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(18),

          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,

            children: [
              const SizedBox(height: 25),

              // Campo de busca
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: cidadeController,
                      decoration: InputDecoration(
                        hintText: "Buscar por cidade",
                        prefixIcon: const Icon(Icons.search),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(25),
                        ),
                      ),
                      onSubmitted: (valor) {
                        setState(() {
                          cidade = valor;
                        });
                        buscarClima();
                      },
                    ),
                  ),

                  const SizedBox(width: 10),

                  IconButton(
                    icon: const Icon(Icons.location_on, size: 35),
                    onPressed: () {
                      cidadeController.clear();
                      buscarClimaPorLocalizacao();
                    },
                  ),
                ],
              ),

              const SizedBox(height: 30),

              Text(
                "Resultado:",
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w500,
                  color: acessibilidade.corPrimaria,
                ),
              ),

              const SizedBox(height: 15),

              // RESULTADO DO CLIMA (sem altura fixa, cresce com o texto)
              if (buscouClima)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: acessibilidade.corSecundaria,
                    borderRadius: BorderRadius.circular(25),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              cidade,
                              style: TextStyle(
                                fontSize: 18,
                                color: acessibilidade.corPrimaria,
                              ),
                            ),
                            const SizedBox(height: 10),
                            Text(
                              temperatura,
                              style: TextStyle(
                                fontSize: 50,
                                fontWeight: FontWeight.bold,
                                color: acessibilidade.corPrimaria,
                              ),
                            ),
                            Text(
                              descricao,
                              style: TextStyle(
                                fontSize: 18,
                                color: acessibilidade.corPrimaria,
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(width: 10),

                      Icon(
                        Icons.cloud,
                        size: 80,
                        color: acessibilidade.corPrimaria,
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
