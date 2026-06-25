import '../exportador_import.dart';



class ContainerPerfilSuperior extends StatelessWidget{

  final Function(int) onChangePage;

  const ContainerPerfilSuperior({
    super.key,
    required this.onChangePage,
  });

  @override
  Widget build(BuildContext context){
    return Container(
      padding: EdgeInsets.fromLTRB(20, 0, 15, 0),
      child: SizedBox(
        width: double.infinity,
        height: 100,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.end,
          mainAxisSize: MainAxisSize.max,
          children: [
            Material(
              color: Colors.transparent,
              shape: CircleBorder(),
              child: InkWell(
                borderRadius: BorderRadius.circular(33),
                onTap: () {
                  // TODO: Navegar para a tela de perfil quando existir
                  // onChangePage(?);
                },

                child: Container(
                  width: 65,
                  height: 65,

                  decoration: BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                  ),

                  child: SvgPicture.asset(
                    'gfx/svg/icons/User_Icon.svg',
                    width: double.infinity,
                    height: double.infinity,
                    fit: BoxFit.cover,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}