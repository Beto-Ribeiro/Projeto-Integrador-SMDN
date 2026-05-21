import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: 'https://robfgvtnoooivihlnomr.supabase.co',
    anonKey:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvYmZndnRub29vaXZpaGxub21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3Mzg0MjQsImV4cCI6MjA5MTMxNDQyNH0.ne-W9-g5l-Wnx-sYi08GyZplokBPiBy-0HPcLm49-u8',
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
  final email = TextEditingController();
  final telefone = TextEditingController();
  final cpf = TextEditingController();

  final idade = TextEditingController();
  final peso = TextEditingController();
  final altura = TextEditingController();

  final alergias = TextEditingController();
  final observacoes = TextEditingController();

  String tipoSanguineo = "O+";

  @override
  void initState() {
    super.initState();
    carregarDados();
  }

  Future<void> carregarDados() async {
    try {
      final dados = await supabase.from('Cidadao').select().limit(1).single();

      setState(() {
        nome.text = dados['nome'] ?? '';
        email.text = dados['email'] ?? '';
        telefone.text = dados['telefone'] ?? '';
        cpf.text = dados['cpf'] ?? '';

        idade.text = dados['idade'].toString();
        peso.text = dados['peso'].toString();
        altura.text = dados['altura'].toString();

        tipoSanguineo = dados['tipo_sanguineo'] ?? 'O+';

        alergias.text = dados['alergias'] ?? '';
        observacoes.text = dados['observacoes'] ?? '';
      });
    } catch (e) {
      debugPrint('Erro ao carregar dados: $e');
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
              campoTexto(email, 16, false),
              campoTexto(telefone, 16, false),
              campoTexto(cpf, 16, false),

              const SizedBox(height: 20),

              Row(
                children: [
                  Expanded(child: campoNumericoBox("Idade", idade)),

                  const SizedBox(width: 8),

                  Expanded(child: campoTipoSanguineo()),
                ],
              ),

              const SizedBox(height: 8),

              Row(
                children: [
                  Expanded(child: campoNumericoBox("Peso", peso)),

                  const SizedBox(width: 8),

                  Expanded(child: campoNumericoBox("Altura", altura)),
                ],
              ),

              const SizedBox(height: 30),

              titulo("Alergias"),
              areaTexto(alergias),

              const SizedBox(height: 30),

              titulo("Observações"),
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

  Widget campoNumericoBox(String tituloTxt, TextEditingController controller) {
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
          Text(tituloTxt, style: TextStyle(fontSize: 12, color: azulClaro)),

          const SizedBox(height: 4),

          Text(
            controller.text,
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
}
