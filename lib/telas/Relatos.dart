import 'dart:typed_data';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class Relatos_tela extends StatefulWidget {

  const Relatos_tela({

    super.key,

    required this.title,

  });

  final String title;

  @override
  State<Relatos_tela> createState() =>
      _Relatos_telaState();
}

class _Relatos_telaState
    extends State<Relatos_tela> {

  PlatformFile? imagemSelecionada;

  Uint8List? imagemBytes;

  int? tipoSelecionado;
  int? nivelSelecionado;

  Future<void> selecionarImagem() async {

    final resultado =
    await FilePicker.platform.pickFiles(

      type: FileType.image,

      withData: true,

    );

    if (resultado != null) {

      setState(() {

        imagemSelecionada =
            resultado.files.single;

        imagemBytes =
            resultado.files.single.bytes;

      });
    }
  }

  Future<void> enviarRelato() async {

    try {

      final supabase =
          Supabase.instance.client;

      print(
        supabase.auth.currentUser,
      );

      if (tipoSelecionado == null ||
          nivelSelecionado == null ||
          imagemBytes == null) {

        ScaffoldMessenger.of(context)
            .showSnackBar(

          const SnackBar(

            content: Text(
              'Preencha todos os campos',
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

        'rel_tipo_desastre':
        tipoDesastre,

        'rel_descricao':
        nivelRisco,

      })

          .select()

          .single();

      final relatoId =
      relato['rel_id'];

      final nomeArquivo =

          '${DateTime.now().millisecondsSinceEpoch}.png';

      final caminhoImagem =

          'relatos/$relatoId/$nomeArquivo';

      await supabase.storage

          .from('Foto_Storage')

          .uploadBinary(

        caminhoImagem,

        imagemBytes!,

      );

      await supabase

          .from('Foto')

          .insert({

        'rel_id':
        relatoId,

        'fot_url':
        caminhoImagem,

      });

      ScaffoldMessenger.of(context)
          .showSnackBar(

        const SnackBar(

          content: Text(
            'Relato enviado com sucesso',
          ),
        ),
      );

    } catch (e) {

      print(e);

      ScaffoldMessenger.of(context)
          .showSnackBar(

        SnackBar(

          content: Text(
            'Erro: $e',
          ),
        ),
      );
    }
  }

  Widget radioTipo(
      int valor,
      String texto,
      ) {

    return Column(

      children: [

        GestureDetector(

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

              color:

              tipoSelecionado == valor

                  ? Colors.blue

                  : Colors.transparent,

              border: Border.all(

                color: Colors.blue,

                width: 2,
              ),
            ),
          ),
        ),

        const SizedBox(height: 5),

        Text(texto),
      ],
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

              color:

              nivelSelecionado == valor

                  ? cor

                  : Colors.transparent,

              border: Border.all(
                color: cor,
                width: 2,
              ),

              borderRadius:
              BorderRadius.circular(5),
            ),
          ),
        ),

        const SizedBox(height: 5),

        Text(texto),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {

    return Scaffold(

      backgroundColor: Colors.white,

      body: SafeArea(

        child: SingleChildScrollView(

          child: Padding(

            padding: const EdgeInsets.all(20),

            child: Column(

              children: [

                const SizedBox(height: 20),

                const Text(

                  'Informe as informações para reportar:',

                  style: TextStyle(

                    fontSize: 21,

                    fontWeight:
                    FontWeight.bold,
                  ),
                ),

                const SizedBox(height: 20),

                GestureDetector(

                  onTap: selecionarImagem,

                  child: Container(

                    width: double.infinity,

                    height: 180,

                    decoration: BoxDecoration(

                      border: Border.all(),

                      borderRadius:
                      BorderRadius.circular(8),
                    ),

                    child: imagemBytes == null

                        ? const Center(

                      child: Text(
                        'Selecionar imagem',
                      ),
                    )

                        : ClipRRect(

                      borderRadius:
                      BorderRadius.circular(8),

                      child: Image.memory(

                        imagemBytes!,

                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 30),

                const Text(

                  'Tipo de desastre',

                  style: TextStyle(

                    fontSize: 18,

                    fontWeight:
                    FontWeight.bold,
                  ),
                ),

                const SizedBox(height: 20),

                Row(

                  mainAxisAlignment:
                  MainAxisAlignment.spaceEvenly,

                  children: [

                    radioTipo(
                      0,
                      'Enchente',
                    ),

                    radioTipo(
                      1,
                      'Ciclone',
                    ),

                    radioTipo(
                      2,
                      'Deslizamento',
                    ),

                    radioTipo(
                      3,
                      'Chuva Forte',
                    ),
                  ],
                ),

                const SizedBox(height: 30),

                const Text(

                  'Nível de risco',

                  style: TextStyle(

                    fontSize: 18,

                    fontWeight:
                    FontWeight.bold,
                  ),
                ),

                const SizedBox(height: 20),

                Row(

                  mainAxisAlignment:
                  MainAxisAlignment.spaceEvenly,

                  children: [

                    nivelBox(
                      0,
                      Colors.yellow,
                      '1',
                    ),

                    nivelBox(
                      1,
                      Colors.orangeAccent,
                      '2',
                    ),

                    nivelBox(
                      2,
                      Colors.orange,
                      '3',
                    ),

                    nivelBox(
                      3,
                      Colors.deepOrange,
                      '4',
                    ),

                    nivelBox(
                      4,
                      Colors.red,
                      '5',
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
      ),
    );
  }
}