import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: 'https://robfgvtnoooivihlnomr.supabase.co',
    anonKey: 'sb_publishable_eVCeoqzfhoAgkpBnJxzs7w_-PGO0TO9',
  );

  runApp(const MeuApp());
}

class MeuApp extends StatelessWidget {
  const MeuApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      debugShowCheckedModeBanner: false,
      home: TelaPerfil(),
    );
  }
}

class TelaPerfil extends StatefulWidget {
  const TelaPerfil({super.key});

  @override
  State<TelaPerfil> createState() => _TelaPerfilState();
}

class _TelaPerfilState extends State<TelaPerfil> {
  final supabase = Supabase.instance.client;

  final nome = TextEditingController();
  final cpf = TextEditingController();
  final alergias = TextEditingController();
  final observacoes = TextEditingController();

  String tipoUsuario = "";
  String tipoSanguineo = "O+";

  bool menuAberto = false;
  bool daltonismo = false;
  bool letrasGrandes = false;
  bool altoContraste = false;

  Color get azul {
    if (altoContraste) return Colors.yellow;
    return daltonismo ? const Color(0xFF6A4C93) : const Color(0xFF1D3557);
  }

  Color get azulClaro {
    if (altoContraste) return Colors.white;
    return daltonismo ? const Color(0xFFF4A261) : const Color(0xFF8FB3D9);
  }

  @override
  void initState() {
    super.initState();
    carregarDados();
  }

  Future<void> carregarDados() async {
    try {
      final perfil = await supabase.from('Perfis').select().limit(1).single();
      final cidadao = await supabase.from('Cidadao').select().limit(1).single();
      final historico = await supabase
          .from('Historico_Medicacao_Cidadao')
          .select()
          .limit(1)
          .single();

      setState(() {
        nome.text = perfil['prf_nome'] ?? '';
        cpf.text = cidadao['cid_cpf'] ?? '';
        tipoSanguineo = historico['hmc_tipo_sanguineo'] ?? '';
        alergias.text = historico['hmc_alergias'] ?? '';
        observacoes.text = historico['hmc_doencas_cronicas'] ?? '';
      });
    } catch (e) {
      print(e);
    }
  }

  @override
  Widget build(BuildContext context) {
    return MediaQuery(
      data: MediaQuery.of(
        context,
      ).copyWith(textScaler: TextScaler.linear(letrasGrandes ? 1.5 : 1.0)),
      child: Scaffold(
        backgroundColor: altoContraste ? Colors.black : const Color(0xFFF5F7FA),

        body: Stack(
          children: [
            SafeArea(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(18),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        topoIcone(Icons.arrow_back_ios_new),
                        GestureDetector(
                          onTap: () {
                            setState(() {
                              menuAberto = !menuAberto;
                            });
                          },
                          child: topoIcone(Icons.settings),
                        ),
                      ],
                    ),

                    const SizedBox(height: 20),

                    Text(
                      "Perfil do usuário",
                      style: TextStyle(
                        color: altoContraste
                            ? Colors.white
                            : Colors.grey.shade500,
                        fontStyle: FontStyle.italic,
                      ),
                    ),

                    const SizedBox(height: 15),

                    Container(
                      width: 95,
                      height: 95,
                      decoration: BoxDecoration(
                        color: altoContraste
                            ? Colors.grey.shade800
                            : Colors.grey.shade300,
                        borderRadius: BorderRadius.circular(18),
                      ),
                      child: const Icon(
                        Icons.person,
                        size: 45,
                        color: Colors.white,
                      ),
                    ),

                    const SizedBox(height: 20),

                    Text(
                      nome.text,
                      style: TextStyle(fontSize: 28, color: azul),
                    ),

                    Text(cpf.text, style: TextStyle(color: azulClaro)),

                    const SizedBox(height: 20),

                    campoBox("Tipo sanguíneo", tipoSanguineo),

                    const SizedBox(height: 20),

                    campoBox("Alergias", alergias.text),
                    campoBox("Doenças", observacoes.text),
                  ],
                ),
              ),
            ),

            if (menuAberto)
              GestureDetector(
                onTap: () => setState(() => menuAberto = false),
                child: Container(color: Colors.black45),
              ),

            AnimatedPositioned(
              duration: const Duration(milliseconds: 300),
              right: menuAberto ? 0 : -280,
              top: 0,
              bottom: 0,
              child: Container(
                width: 280,
                color: altoContraste ? Colors.black : Colors.white,
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 50),
                    const Text(
                      "Acessibilidade",
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                      ),
                    ),

                    SwitchListTile(
                      title: const Text("Daltonismo"),
                      value: daltonismo,
                      onChanged: (v) => setState(() => daltonismo = v),
                    ),

                    SwitchListTile(
                      title: const Text("Letras grandes"),
                      value: letrasGrandes,
                      onChanged: (v) => setState(() => letrasGrandes = v),
                    ),

                    SwitchListTile(
                      title: const Text("Alto contraste"),
                      value: altoContraste,
                      onChanged: (v) => setState(() => altoContraste = v),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget topoIcone(IconData icon) {
    return Container(
      width: 38,
      height: 38,
      decoration: BoxDecoration(
        color: Colors.blue.shade50,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Icon(icon, size: 18, color: Colors.lightBlue),
    );
  }

  Widget campoBox(String titulo, String valor) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(top: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        border: Border.all(color: azulClaro),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Text(titulo, style: TextStyle(color: azulClaro)),
          const SizedBox(height: 5),
          Text(
            valor.isEmpty ? "Nenhuma informação" : valor,
            style: TextStyle(color: azul),
          ),
        ],
      ),
    );
  }
}
