import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

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
  IconData iconeClima = Icons.cloud;
  bool buscouClima = false;

  List<String> historicoCidades = [];
  List<String> sugestoes = [];

  final String apiKey = "b5ead541b23bfa3331c7cf3de0678295";

  @override
  void initState() {
    super.initState();
    carregarHistorico();
  }

  Future<void> carregarHistorico() async {
    final prefs = await SharedPreferences.getInstance();

    setState(() {
      historicoCidades = prefs.getStringList('historico_cidades') ?? [];
    });
  }

  Future<void> salvarCidade(String cidade) async {
    final prefs = await SharedPreferences.getInstance();

    historicoCidades.remove(cidade);
    historicoCidades.insert(0, cidade);

    if (historicoCidades.length > 10) {
      historicoCidades = historicoCidades.take(10).toList();
    }

    await prefs.setStringList('historico_cidades', historicoCidades);
  }

  IconData obterIconeClima(String descricao) {
    descricao = descricao.toLowerCase();

    if (descricao.contains("chuva")) return Icons.thunderstorm;
    if (descricao.contains("nuvem") || descricao.contains("nublado")) {
      return Icons.cloud;
    }
    if (descricao.contains("sol") || descricao.contains("limpo")) {
      return Icons.wb_sunny;
    }
    if (descricao.contains("neve")) return Icons.ac_unit;

    if (descricao.contains("névoa") || descricao.contains("neblina")) {
      return Icons.blur_on;
    }

    return Icons.cloud;
  }

  // 🔎 AGORA SOMENTE CIDADES DO BRASIL
  Future<List<String>> buscarSugestoes(String texto) async {
    if (texto.trim().length < 2) return [];

    final response = await http.get(
      Uri.parse(
        "https://api.openweathermap.org/geo/1.0/direct"
        "?q=$texto&limit=5&appid=$apiKey&country=BR",
      ),
    );

    if (response.statusCode == 200) {
      final dados = jsonDecode(response.body);

      return (dados as List)
          .map((cidade) => cidade["name"].toString())
          .toSet()
          .toList();
    }

    return [];
  }

  Future<void> buscarClima() async {
    final url =
        "https://api.openweathermap.org/data/2.5/weather"
        "?q=$cidade&appid=$apiKey&units=metric&lang=pt_br";

    final response = await http.get(Uri.parse(url));

    if (response.statusCode == 200) {
      final dados = jsonDecode(response.body);

      await salvarCidade(dados["name"]);

      setState(() {
        cidade = dados["name"];
        temperatura = "${dados["main"]["temp"].round()}°";
        descricao = dados["weather"][0]["description"];
        iconeClima = obterIconeClima(descricao);
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
              Align(
                alignment: Alignment.topRight,
                child: CircleAvatar(
                  radius: 22,
                  backgroundColor: const Color(0xFF051B3D),
                  child: const Icon(Icons.person_outline, color: Colors.white),
                ),
              ),

              const SizedBox(height: 25),

              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: cidadeController,
                      onChanged: (value) async {
                        final result = await buscarSugestoes(value);
                        setState(() {
                          sugestoes = result;
                        });
                      },
                      decoration: const InputDecoration(
                        hintText: "Digite uma cidade",
                        border: OutlineInputBorder(),
                      ),
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

              if (sugestoes.isNotEmpty)
                Container(
                  margin: const EdgeInsets.only(top: 5),
                  constraints: const BoxConstraints(maxHeight: 200),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: ListView.builder(
                    shrinkWrap: true,
                    itemCount: sugestoes.length,
                    itemBuilder: (context, index) {
                      return ListTile(
                        leading: const Icon(Icons.location_city),
                        title: Text(sugestoes[index]),
                        onTap: () {
                          cidadeController.text = sugestoes[index];

                          setState(() {
                            cidade = sugestoes[index];
                            sugestoes.clear();
                          });

                          buscarClima();
                        },
                      );
                    },
                  ),
                ),

              const SizedBox(height: 30),

              const Text(
                "Resultado:",
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w500),
              ),

              const SizedBox(height: 25),

              if (buscouClima)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: const Color(0xFFAFC7DA),
                    borderRadius: BorderRadius.circular(25),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(cidade, style: const TextStyle(fontSize: 18)),
                          const SizedBox(height: 10),
                          Text(
                            temperatura,
                            style: const TextStyle(
                              fontSize: 50,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(descricao, style: const TextStyle(fontSize: 18)),
                        ],
                      ),
                      Icon(iconeClima, size: 80),
                    ],
                  ),
                ),

              const SizedBox(height: 20),

              // 🔥 HISTÓRICO SÓ APARECE SE EXISTIR
              if (historicoCidades.isNotEmpty) ...[
                const Text(
                  "Histórico",
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),

                const SizedBox(height: 10),

                Expanded(
                  child: ListView.builder(
                    itemCount: historicoCidades.length,
                    itemBuilder: (context, index) {
                      return Card(
                        child: ListTile(
                          leading: const Icon(Icons.history),
                          title: Text(historicoCidades[index]),
                          onTap: () {
                            cidadeController.text = historicoCidades[index];

                            setState(() {
                              cidade = historicoCidades[index];
                            });

                            buscarClima();
                          },
                        ),
                      );
                    },
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
