/*import 'package:flutter/material.dart';
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

  final azul = const Color(0xFF1D3557);
  final azulClaro = const Color(0xFF8FB3D9);

  final double alturaCard = 90;

  final nome = TextEditingController();
  final cpf = TextEditingController();

  final alergias = TextEditingController();
  final observacoes = TextEditingController();

  String tipoUsuario = "";
  String tipoSanguineo = "O+";

  @override
  void initState() {
    super.initState();
    carregarDados();
  }

  Future<void> carregarDados() async {
    try {
      // PERFIS
      final perfil = await supabase.from('Perfis').select().limit(1).single();

      // CIDADAO
      final cidadao = await supabase.from('Cidadao').select().limit(1).single();

      // HISTORICO
      final historico = await supabase
          .from('Historico_Medicacao_Cidadao')
          .select()
          .limit(1)
          .single();

      print(perfil);
      print(cidadao);
      print(historico);

      setState(() {
        // PERFIL
        nome.text = perfil['prf_nome'] ?? '';

        // CIDADAO
        cpf.text = cidadao['cid_cpf'] ?? '';

        // HISTORICO
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
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),

      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(18),

          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  topoIcone(Icons.arrow_back_ios_new),
                  topoIcone(Icons.person),
                ],
              ),

              const SizedBox(height: 20),

              Text(
                "Perfil do usuário",
                style: TextStyle(
                  color: Colors.grey.shade500,
                  fontStyle: FontStyle.italic,
                ),
              ),

              const SizedBox(height: 15),

              Container(
                width: 95,
                height: 95,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(18),
                ),
                child: const Icon(Icons.person, size: 45, color: Colors.white),
              ),

              const SizedBox(height: 20),

              campoTexto(nome, 28, true),

              campoTexto(TextEditingController(text: tipoUsuario), 16, false),

              campoTexto(cpf, 16, false),

              const SizedBox(height: 20),

              campoTipoSanguineo(),

              const SizedBox(height: 30),

              titulo("Alergias"),
              areaTexto(alergias),

              const SizedBox(height: 30),

              titulo("Doenças"),
              areaTexto(observacoes),

              const SizedBox(height: 30),
            ],
          ),
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

  Widget campoTexto(
    TextEditingController controller,
    double tamanho,
    bool destaque,
  ) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),

      child: Text(
        controller.text,
        textAlign: TextAlign.center,

        style: TextStyle(
          fontSize: tamanho,
          fontWeight: destaque ? FontWeight.bold : FontWeight.normal,
          color: destaque ? azul : azulClaro,
        ),
      ),
    );
  }

  Widget campoTipoSanguineo() {
    return Container(
      height: alturaCard,

      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),

      decoration: BoxDecoration(
        border: Border.all(color: azulClaro),
        borderRadius: BorderRadius.circular(12),
      ),

      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,

        children: [
          Text(
            "Tipo sanguíneo",
            style: TextStyle(fontSize: 12, color: azulClaro),
          ),

          const SizedBox(height: 4),

          Text(
            tipoSanguineo,

            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: azul,
            ),
          ),
        ],
      ),
    );
  }

  Widget titulo(String texto) {
    return Text(
      texto,

      style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: azul),
    );
  }

  Widget areaTexto(TextEditingController controller) {
    return Container(
      width: double.infinity,

      margin: const EdgeInsets.only(top: 10),

      padding: const EdgeInsets.all(12),

      decoration: BoxDecoration(
        border: Border.all(color: azulClaro),
        borderRadius: BorderRadius.circular(12),
      ),

      child: Text(
        controller.text.isEmpty ? "Nenhuma informação" : controller.text,

        style: TextStyle(fontSize: 16, color: azul),
      ),
    );
  }
}*/
