import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'exportador_import.dart';

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
    final url =
        "https://api.openweathermap.org/data/2.5/weather?q=$cidade&appid=$apiKey&units=metric&lang=pt_br";

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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1F3F5),

      body: SafeArea(
        child: Padding(
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
                      setState(() {
                        cidade = cidadeController.text;
                      });
                      buscarClima();
                    },
                  ),
                ],
              ),

              const SizedBox(height: 30),

              const Text(
                "Resultado:",
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w500,
                ),
              ),

              const SizedBox(height: 15),

              // RESULTADO DO CLIMA (CORRIGIDO)
              if (buscouClima)
                Container(
                  height: 150,
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: const Color(0xFFAFC7DA),
                    borderRadius: BorderRadius.circular(25),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      SingleChildScrollView(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              cidade,
                              style: const TextStyle(fontSize: 18),
                            ),
                            const SizedBox(height: 10),
                            Text(
                              temperatura,
                              style: const TextStyle(
                                fontSize: 50,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              descricao,
                              style: const TextStyle(fontSize: 18),
                            ),
                          ],
                        ),
                      ),

                      const Icon(
                        Icons.cloud,
                        size: 80,
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
