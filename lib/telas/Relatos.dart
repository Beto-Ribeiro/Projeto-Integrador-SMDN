import 'dart:typed_data';

import 'package:branch1/telas/exportador_import.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class Relatos_tela extends StatefulWidget {
  final Function(int) onChangePage;
  const Relatos_tela({
    super.key,

    required this.title,
    required this.onChangePage,
  });

  final String title;

  @override
  State<Relatos_tela> createState() => _Relatos_telaState();
}

class _Relatos_telaState extends State<Relatos_tela> {


  PlatformFile? imagemSelecionada;

  Uint8List? imagemBytes;

  int? tipoSelecionado;
  int? nivelSelecionado;

  Future<void> selecionarImagem() async {
    FilePickerResult? resultado = await FilePicker.platform.pickFiles(
      type: FileType.image,

      withData: true,
    );

    if (resultado != null) {
      setState(() {
        imagemSelecionada = resultado.files.single;

        imagemBytes = resultado.files.single.bytes;
      });
    }
  }

  Future<void> enviarRelato() async {
    try {
      final supabase = Supabase.instance.client;

      if (tipoSelecionado == null ||
          nivelSelecionado == null ||
          imagemSelecionada == null ||
          imagemBytes == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Preencha todos os campos.',
            ),
          ),
        );

        return;
      }

      String tipoDesastre = '';

      switch (tipoSelecionado) {
        case 0:
          tipoDesastre = 'Enchente';
          break;

        case 1:
          tipoDesastre = 'Ciclone';
          break;

        case 2:
          tipoDesastre = 'Deslizamento';
          break;

        case 3:
          tipoDesastre = 'Chuva Forte';
          break;
      }

      String nivelRisco = '';

      switch (nivelSelecionado) {
        case 0:
          nivelRisco = 'Baixo';
          break;

        case 1:
          nivelRisco = 'Moderado';
          break;

        case 2:
          nivelRisco = 'Alto';
          break;

        case 3:
          nivelRisco = 'Muito Alto';
          break;

        case 4:
          nivelRisco = 'Crítico';
          break;
      }

      final relato = await supabase
          .from('Relato')
          .insert({
            'rel_tipo_desastre': tipoDesastre,

            'rel_descricao': nivelRisco,

            'rel_user_id': 'd5915095-8664-495d-a24f-f2d3a2dcf652',
          })
          .select()
          .single();

      final relatoId = relato['rel_id'];

      final nomeArquivo = '${DateTime.now().millisecondsSinceEpoch}.png';

      final path = 'relatos/$relatoId/$nomeArquivo';

      await supabase.storage
          .from('fotos')
          .uploadBinary(
            path,

            imagemBytes!,
          );

      await supabase.from('Fotos').insert({
        'rel_id': relatoId,

        'foto_path': path,
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Relato enviado com sucesso!',
          ),
        ),
      );
    } catch (e) {
      print(e);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Erro: $e',
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,

      body: SafeArea(
        child: Stack(
          children: [
            SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.all(20),

                child: Column(
                  children: [
                    const SizedBox(height: 20),

                    const Text(
                      'Informe as informações para reportar:',

                      style: TextStyle(
                        fontSize: 21,

                        fontWeight: FontWeight.bold,

                        color: Colors.black,
                      ),
                    ),

                    const SizedBox(height: 20),

                    GestureDetector(
                      onTap: selecionarImagem,

                      child: Container(
                        width: double.infinity,

                        height: 150,

                        decoration: BoxDecoration(
                          border: Border.all(
                            color: Colors.black,
                          ),

                          borderRadius: BorderRadius.circular(8),
                        ),

                        child: imagemBytes == null
                            ? const Center(
                                child: Text(
                                  'Insira uma imagem',
                                ),
                              )
                            : ClipRRect(
                                borderRadius: BorderRadius.circular(7),

                                child: Image.memory(
                                  imagemBytes!,

                                  fit: BoxFit.cover,
                                ),
                              ),
                      ),
                    ),

                    const SizedBox(height: 30),

                    const Text(
                      'Escolha o tipo de desastre:',

                      style: TextStyle(
                        fontSize: 20,

                        fontWeight: FontWeight.bold,

                        color: Colors.black54,
                      ),
                    ),

                    const SizedBox(height: 20),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,

                      children: [
                        radioTipo(0),

                        const SizedBox(width: 10),

                        radioTipo(1),

                        const SizedBox(width: 10),

                        radioTipo(2),

                        const SizedBox(width: 10),

                        radioTipo(3),
                      ],
                    ),

                    const SizedBox(height: 10),

                    const Wrap(
                      alignment: WrapAlignment.center,

                      spacing: 10,

                      children: [
                        Text('Enchente'),

                        Text('Ciclone'),

                        Text('Deslizamento'),

                        Text('Chuva Forte'),
                      ],
                    ),

                    const SizedBox(height: 30),

                    const Text(
                      'Classifique o risco:',

                      style: TextStyle(
                        fontSize: 20,

                        fontWeight: FontWeight.bold,

                        color: Colors.black54,
                      ),
                    ),

                    const SizedBox(height: 20),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,

                      children: [
                        nivelBox(
                          0,
                          Colors.yellowAccent,
                          "1",
                        ),

                        const SizedBox(width: 15),

                        nivelBox(
                          1,
                          Colors.orangeAccent,
                          "2",
                        ),

                        const SizedBox(width: 15),

                        nivelBox(
                          2,
                          Colors.orange,
                          "3",
                        ),

                        const SizedBox(width: 15),

                        nivelBox(
                          3,
                          Colors.deepOrange,
                          "4",
                        ),

                        const SizedBox(width: 15),

                        nivelBox(
                          4,
                          Colors.red,
                          "5",
                        ),
                      ],
                    ),

                    const SizedBox(height: 40),

                    ElevatedButton(
                      onPressed: enviarRelato,

                      child: const Text(
                        'Enviar Relato',
                      ),
                    ),
                  ],
                ),
              ),
            ),

            ContainerPerfilSuperior(onChangePage: widget.onChangePage,),
          ],
        ),
      ),
    );
  }

  Widget radioTipo(int valor) {
    return GestureDetector(
      onTap: () {
        setState(() {
          tipoSelecionado = valor;
        });
      },

      child: Container(
        width: 24,
        height: 24,

        decoration: BoxDecoration(
          shape: BoxShape.circle,

          color: tipoSelecionado == valor ? Colors.blue : Colors.transparent,

          border: Border.all(
            color: Colors.blue,

            width: 2,
          ),
        ),
      ),
    );
  }

  Widget nivelBox(
    int valor,
    Color cor,
    String texto,
  ) {
    return Column(
      children: [
        GestureDetector(
          onTap: () {
            setState(() {
              nivelSelecionado = valor;
            });
          },

          child: Container(
            width: 24,
            height: 24,

            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(5),

              color: nivelSelecionado == valor ? cor : Colors.transparent,

              border: Border.all(
                color: cor,

                width: 2,
              ),
            ),
          ),
        ),

        const SizedBox(height: 4),

        Text(
          texto,

          style: TextStyle(
            fontSize: 12,

            color: cor,
          ),
        ),
      ],
    );
  }
}
