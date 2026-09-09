import { useState, useEffect } from 'react';
import {
  FiFileText,
  FiRefreshCw,
  FiDownload
} from 'react-icons/fi';

import api from '../services/api';
import Navbar from '../components/Navbar';
import { useToast } from '../context/ToastContext';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';


export default function Rapport() {

  const { toast } = useToast();

  const [projets, setProjets] = useState([]);
  const [selectedProjet, setSelectedProjet] = useState('');

  const [rapport, setRapport] = useState(null);

  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);



  /*
  ==========================
  Charger projets
  ==========================
  */

  useEffect(() => {

    const loadProjets = async () => {

      try {

        const res = await api.get('/projets');

        setProjets(res.data);

      } catch(error) {

        toast.error(
          "Erreur chargement projets",
          "❌"
        );

      }

    };


    loadProjets();


  }, []);



  /*
  ==========================
  Générer rapport IA
  ==========================
  */

  const generateRapport = async () => {


    if(!selectedProjet){

      toast.warning(
        "Sélectionnez un projet !",
        "⚠️"
      );

      return;

    }


    setLoading(true);
    setRapport(null);



    try {


      const res = await api.get(
        `/rapports/${selectedProjet}`
      );


      setRapport(res.data);


      toast.success(
        "Rapport généré !",
        "🤖"
      );



    }catch(error){


      console.log(error);


      toast.error(
        "Erreur génération rapport",
        "❌"
      );


    }finally{

      setLoading(false);

    }

  };





  /*
  ==========================
  Export PDF corrigé
  ==========================
  */

  const downloadPDF = async () => {


    if(!rapport) return;



    const element =
      document.getElementById(
        "rapport-content"
      );



    const clone =
      element.cloneNode(true);



    /*
    Style PDF
    */

    clone.style.width = "794px";

    clone.style.padding = "40px";

    clone.style.backgroundColor = "#ffffff";

    clone.style.color = "#000000";



    /*
    Forcer tous les éléments
    */

    clone
    .querySelectorAll("*")
    .forEach((el)=>{


      el.style.color = "#000000";

      el.style.backgroundColor = "#ffffff";

      el.style.borderColor = "#333333";


    });



    /*
    Tables
    */

    clone
    .querySelectorAll("table")
    .forEach(table=>{


      table.style.width="100%";

      table.style.borderCollapse="collapse";


    });



    clone
    .querySelectorAll("th, td")
    .forEach(cell=>{


      cell.style.border =
        "1px solid #333";


      cell.style.padding =
        "8px";


      cell.style.color =
        "#000";


    });



    clone.style.position="absolute";

    clone.style.left="-9999px";


    document.body.appendChild(clone);



    setPdfLoading(true);



    try{


      const html2pdf =
        (await import(
          "html2pdf.js"
        )).default;



      await html2pdf()

      .set({

        margin:10,


        filename:
        `rapport-${rapport.projet}.pdf`,



        image:{
          type:"jpeg",
          quality:1
        },


        html2canvas:{

          scale:2,

          backgroundColor:"#ffffff"

        },


        jsPDF:{

          unit:"mm",

          format:"a4",

          orientation:"portrait"

        }



      })

      .from(clone)

      .save();



      toast.success(
        "PDF téléchargé !",
        "📄"
      );



    }catch(error){


      console.log(error);


      toast.error(
        "Erreur création PDF",
        "❌"
      );


    }finally{


      document.body.removeChild(clone);

      setPdfLoading(false);


    }



  };






  const formatDuration=(seconds)=>{


    const h =
      Math.floor(seconds / 3600);


    const m =
      Math.floor(
        (seconds % 3600)/60
      );


    return `${h}h ${m}m`;

  };






  return (

<div className="min-h-screen bg-gray-950">


<Navbar />



<div className="max-w-4xl mx-auto px-4 py-8">



<h1 className="text-2xl font-bold text-white mb-8">
Rapport IA
</h1>





<div className="bg-gray-900 rounded-2xl p-6 mb-6">


<h2 className="text-white font-semibold mb-4">
Sélectionnez un projet
</h2>



<div className="flex gap-4">


<select

value={selectedProjet}

onChange={
e=>setSelectedProjet(e.target.value)
}

className="
flex-1
bg-gray-800
text-white
px-4
py-3
rounded-lg
"


>


<option value="">
Choisir un projet...
</option>


{
projets.map(p=>(

<option
key={p.id}
value={p.id}
>

{p.name}

</option>

))
}


</select>





<button

onClick={generateRapport}

disabled={
loading ||
!selectedProjet
}

className="
bg-indigo-600
text-white
px-6
py-3
rounded-lg
flex
items-center
gap-2
"


>


{
loading ?

<>

<FiRefreshCw className="animate-spin"/>

Génération...

</>

:

<>

<FiFileText/>

Générer

</>

}


</button>


</div>


</div>






{
rapport &&

<>


<div className="
grid
grid-cols-3
gap-4
mb-6
">


<div className="bg-gray-900 p-4 rounded-xl text-center">

<p className="text-gray-400">
Temps total
</p>


<p className="text-white font-bold text-xl">

{formatDuration(
rapport.stats.totalDuration
)}

</p>

</div>





<div className="bg-gray-900 p-4 rounded-xl text-center">

<p className="text-gray-400">
Tâches
</p>


<p className="text-white font-bold text-xl">

{rapport.stats.tachesCount}

</p>

</div>





<div className="bg-gray-900 p-4 rounded-xl text-center">

<p className="text-gray-400">
Membres
</p>


<p className="text-white font-bold text-xl">

{rapport.stats.membresCount}

</p>

</div>


</div>







<div className="bg-gray-900 rounded-2xl p-6">


<div className="
flex
justify-between
items-center
mb-5
">


<h2 className="text-white text-lg font-semibold">

🤖 Analyse IA —
{rapport.projet}

</h2>




<button

onClick={downloadPDF}

disabled={pdfLoading}

className="
bg-gray-700
text-white
px-4
py-2
rounded-lg
flex
gap-2
"

>


<FiDownload/>


{
pdfLoading
?
"Création..."
:
"Télécharger PDF"
}


</button>


</div>







<div
id="rapport-content"

className="
bg-white
text-black
p-6
rounded-lg
"
>


<ReactMarkdown

remarkPlugins={[
remarkGfm
]}

rehypePlugins={[
rehypeRaw
]}


components={{


h2:({children})=>(

<h2 className="
text-black
font-bold
text-xl
mt-5
mb-3
">

{children}

</h2>

),


h3:({children})=>(

<h3 className="
text-black
font-bold
mt-4
">

{children}

</h3>

),



p:({children})=>(

<p className="
text-black
mb-3
">

{children}

</p>

),



strong:({children})=>(

<strong className="
text-black
font-bold
">

{children}

</strong>

),



table:({children})=>(

<table className="
w-full
border-collapse
border
border-black
">

{children}

</table>

),



th:({children})=>(

<th className="
border
border-black
p-2
bg-gray-200
text-black
">

{children}

</th>

),



td:({children})=>(

<td className="
border
border-black
p-2
text-black
">

{children}

</td>

)



}}



>


{rapport.rapport}


</ReactMarkdown>


</div>



</div>


</>

}





</div>


</div>


);

}