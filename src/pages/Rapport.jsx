import { useState, useEffect } from "react";
import { FiFileText, FiRefreshCw, FiDownload } from "react-icons/fi";

import api from "../services/api";
import Navbar from "../components/Navbar";
import { useToast } from "../context/ToastContext";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

export default function Rapport() {
  const { toast } = useToast();

  const [projets, setProjets] = useState([]);
  const [selectedProjet, setSelectedProjet] = useState("");

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
        const res = await api.get("/projets");

        setProjets(res.data);
      } catch (error) {
        toast.error("Erreur chargement projets", "❌");
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
    if (!selectedProjet) {
      toast.warning("Sélectionnez un projet !", "⚠️");

      return;
    }

    setLoading(true);
    setRapport(null);

    try {
      const res = await api.get(`/rapports/${selectedProjet}`);

      setRapport(res.data);

      toast.success("Rapport généré !", "🤖");
    } catch (error) {
      console.log(error);

      toast.error("Erreur génération rapport", "❌");
    } finally {
      setLoading(false);
    }
  };

  /*
  ==========================
  Export PDF corrigé
  ==========================
  */

  const downloadPDF = async () => {
    if (!rapport || pdfLoading) return;

    const element = document.getElementById("rapport-content");

    if (!element) {
      toast.error("Contenu du rapport introuvable", "❌");
      return;
    }

    setPdfLoading(true);

    try {
      const html2pdfModule = await import("html2pdf.js");
      const html2pdf = html2pdfModule.default || html2pdfModule;

      const safeProjectName = (rapport.projet || "rapport")
        .replace(/[<>:"/\\|?*]/g, "-")
        .trim();

      const date = new Date().toISOString().split("T")[0];

      const options = {
        margin: [10, 10, 10, 10],

        filename: `rapport-${safeProjectName}-${date}.pdf`,

        image: {
          type: "jpeg",
          quality: 0.98,
        },

        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,

          // html2canvas crée lui-même une copie du document.
          // On modifie uniquement cette copie pour le PDF.
          onclone: (clonedDocument) => {
            const pdfContent = clonedDocument.getElementById("rapport-content");

            if (!pdfContent) return;

            pdfContent.style.backgroundColor = "#ffffff";
            pdfContent.style.color = "#111111";
            pdfContent.style.padding = "20px";
            pdfContent.style.borderRadius = "0";
            pdfContent.style.width = "100%";
            pdfContent.style.maxWidth = "100%";

            /*
          =========================
          TEXTE
          =========================
          */

            pdfContent
              .querySelectorAll(
                "p, li, span, strong, em, h1, h2, h3, h4, h5, h6",
              )
              .forEach((el) => {
                el.style.color = "#111111";
              });

            /*
          =========================
          TITRES
          =========================
          */

            pdfContent.querySelectorAll("h1").forEach((el) => {
              el.style.color = "#000000";
              el.style.fontWeight = "700";
              el.style.fontSize = "24px";
              el.style.marginTop = "20px";
              el.style.marginBottom = "12px";
            });

            pdfContent.querySelectorAll("h2").forEach((el) => {
              el.style.color = "#000000";
              el.style.fontWeight = "700";
              el.style.fontSize = "20px";
              el.style.marginTop = "22px";
              el.style.marginBottom = "10px";
              el.style.pageBreakAfter = "avoid";
            });

            pdfContent.querySelectorAll("h3").forEach((el) => {
              el.style.color = "#000000";
              el.style.fontWeight = "700";
              el.style.fontSize = "17px";
              el.style.marginTop = "18px";
              el.style.marginBottom = "8px";
              el.style.pageBreakAfter = "avoid";
            });

            /*
          =========================
          PARAGRAPHES
          =========================
          */

            pdfContent.querySelectorAll("p").forEach((el) => {
              el.style.color = "#111111";
              el.style.lineHeight = "1.6";
            });

            /*
          =========================
          TABLEAUX
          =========================
          */

            pdfContent.querySelectorAll("table").forEach((table) => {
              table.style.width = "100%";
              table.style.maxWidth = "100%";
              table.style.borderCollapse = "collapse";
              table.style.tableLayout = "auto";
              table.style.fontSize = "12px";
              table.style.marginTop = "10px";
              table.style.marginBottom = "18px";
              table.style.backgroundColor = "#ffffff";
            });

            pdfContent.querySelectorAll("thead").forEach((thead) => {
              thead.style.display = "table-header-group";
            });

            pdfContent.querySelectorAll("th").forEach((th) => {
              th.style.backgroundColor = "#e5e7eb";
              th.style.color = "#000000";
              th.style.border = "1px solid #333333";
              th.style.padding = "8px";
              th.style.fontWeight = "700";
              th.style.textAlign = "left";
              th.style.verticalAlign = "top";
              th.style.wordBreak = "break-word";
            });

            pdfContent.querySelectorAll("td").forEach((td) => {
              td.style.backgroundColor = "#ffffff";
              td.style.color = "#111111";
              td.style.border = "1px solid #333333";
              td.style.padding = "8px";
              td.style.verticalAlign = "top";
              td.style.wordBreak = "break-word";
            });

            /*
          Évite de couper une ligne du tableau
          entre deux pages.
          */

            pdfContent.querySelectorAll("tr").forEach((tr) => {
              tr.style.pageBreakInside = "avoid";
              tr.style.breakInside = "avoid";
            });

            /*
          =========================
          LISTES
          =========================
          */

            pdfContent.querySelectorAll("ul").forEach((ul) => {
              ul.style.paddingLeft = "25px";
              ul.style.listStyleType = "disc";
            });

            pdfContent.querySelectorAll("ol").forEach((ol) => {
              ol.style.paddingLeft = "25px";
              ol.style.listStyleType = "decimal";
            });

            /*
          =========================
          LIGNES
          =========================
          */

            pdfContent.querySelectorAll("hr").forEach((hr) => {
              hr.style.border = "0";
              hr.style.borderTop = "1px solid #999999";
              hr.style.margin = "18px 0";
            });

            /*
          =========================
          CITATIONS
          =========================
          */

            pdfContent.querySelectorAll("blockquote").forEach((quote) => {
              quote.style.color = "#333333";
              quote.style.borderLeft = "4px solid #555555";
              quote.style.paddingLeft = "12px";
              quote.style.marginLeft = "0";
            });
          },
        },

        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },

        pagebreak: {
          mode: ["css", "legacy"],

          // Ne pas utiliser "avoid-all":
          // ça peut créer de mauvaises coupures / pages vides.
          avoid: ["tr", "h2", "h3"],
        },
      };

      await html2pdf().set(options).from(element).save();

      toast.success("PDF téléchargé !", "📄");
    } catch (error) {
      console.error("Erreur PDF :", error);

      toast.error("Erreur lors de la création du PDF", "❌");
    } finally {
      setPdfLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);

    const m = Math.floor((seconds % 3600) / 60);

    return `${h}h ${m}m`;
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-8">Rapport IA</h1>

        <div className="bg-gray-900 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-semibold mb-4">
            Sélectionnez un projet
          </h2>

          <div className="flex gap-4">
            <select
              value={selectedProjet}
              onChange={(e) => setSelectedProjet(e.target.value)}
              className="
flex-1
bg-gray-800
text-white
px-4
py-3
rounded-lg
"
            >
              <option value="">Choisir un projet...</option>

              {projets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <button
              onClick={generateRapport}
              disabled={loading || !selectedProjet}
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
              {loading ? (
                <>
                  <FiRefreshCw className="animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <FiFileText />
                  Générer
                </>
              )}
            </button>
          </div>
        </div>

        {rapport && (
          <>
            <div
              className="
grid
grid-cols-3
gap-4
mb-6
"
            >
              <div className="bg-gray-900 p-4 rounded-xl text-center">
                <p className="text-gray-400">Temps total</p>

                <p className="text-white font-bold text-xl">
                  {formatDuration(rapport.stats.totalDuration)}
                </p>
              </div>

              <div className="bg-gray-900 p-4 rounded-xl text-center">
                <p className="text-gray-400">Tâches</p>

                <p className="text-white font-bold text-xl">
                  {rapport.stats.tachesCount}
                </p>
              </div>

              <div className="bg-gray-900 p-4 rounded-xl text-center">
                <p className="text-gray-400">Membres</p>

                <p className="text-white font-bold text-xl">
                  {rapport.stats.membresCount}
                </p>
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl p-6">
              <div
                className="
flex
justify-between
items-center
mb-5
"
              >
                <h2 className="text-white text-lg font-semibold">
                  🤖 Analyse IA —{rapport.projet}
                </h2>

                <button
                  onClick={downloadPDF}
                  disabled={pdfLoading}
                  className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition"
                >
                  {pdfLoading ? (
                    <>
                      <FiRefreshCw className="animate-spin" />
                      Création PDF...
                    </>
                  ) : (
                    <>
                      <FiDownload />
                      Télécharger PDF
                    </>
                  )}
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
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    h2: ({ children }) => (
                      <h2
                        className="
text-black
font-bold
text-xl
mt-5
mb-3
"
                      >
                        {children}
                      </h2>
                    ),

                    h3: ({ children }) => (
                      <h3
                        className="
text-black
font-bold
mt-4
"
                      >
                        {children}
                      </h3>
                    ),

                    p: ({ children }) => (
                      <p
                        className="
text-black
mb-3
"
                      >
                        {children}
                      </p>
                    ),

                    strong: ({ children }) => (
                      <strong
                        className="
text-black
font-bold
"
                      >
                        {children}
                      </strong>
                    ),

                    table: ({ children }) => (
                      <table
                        className="
w-full
border-collapse
border
border-black
"
                      >
                        {children}
                      </table>
                    ),

                    th: ({ children }) => (
                      <th
                        className="
border
border-black
p-2
bg-gray-200
text-black
"
                      >
                        {children}
                      </th>
                    ),

                    td: ({ children }) => (
                      <td
                        className="
border
border-black
p-2
text-black
"
                      >
                        {children}
                      </td>
                    ),
                  }}
                >
                  {rapport.rapport}
                </ReactMarkdown>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
