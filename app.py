"""
Streamlit UI for the research evaluation pipeline (single uploaded document).
Run from project root:  streamlit run app.py
"""

from __future__ import annotations

import json
import os
import sys
import tempfile
from pathlib import Path

import streamlit as st

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from pipeline import run_stages_for_uploaded_file  # noqa: E402

ALLOWED_TYPES = ("txt", "md", "pdf")


def main() -> None:
    st.set_page_config(page_title="Research evaluation agent", layout="wide")
    st.title("Research evaluation agent")
    st.caption("Upload a .txt, .md, or .pdf and enter a query.")

    query = st.text_area("Research query", height=100, placeholder="What do you want to learn from the document?")
    uploaded = st.file_uploader("Document", type=list(ALLOWED_TYPES))

    if st.button("Run pipeline", type="primary"):
        if not query.strip():
            st.error("Please enter a query.")
            return
        if uploaded is None:
            st.error("Please upload a document.")
            return

        suffix = Path(uploaded.name).suffix.lower()
        if suffix not in (".txt", ".md", ".pdf"):
            st.error("Unsupported file type.")
            return

        with st.spinner("Running retrieval, draft, evaluation, revision, grounding…"):
            tmp: Path | None = None
            try:
                fd, tmp_name = tempfile.mkstemp(suffix=suffix)
                os.close(fd)
                tmp = Path(tmp_name)
                tmp.write_bytes(uploaded.getvalue())
                result = run_stages_for_uploaded_file(query, tmp)
            except RuntimeError as e:
                st.error(str(e))
                return
            except OSError as e:
                st.error(f"File error: {e}")
                return
            finally:
                if tmp is not None and tmp.exists():
                    try:
                        tmp.unlink()
                    except OSError:
                        pass

        ev = json.loads(result.evaluation_json)

        c1, c2, c3 = st.columns(3)
        c1.metric("Evaluation score", f"{ev['score']:.1f}")
        c2.metric("Grounding score", result.grounding.grounding_score)
        c3.metric("Revision", "Skipped" if result.revision_skipped else "Applied")

        st.subheader("Final report")
        st.markdown(result.final_report)

        st.subheader("Evaluation issues")
        for item in ev.get("issues", []):
            st.write(f"- {item}")

        st.subheader("Grounding: unsupported points")
        for item in result.grounding.unsupported_points:
            st.write(f"- {item}")

        with st.expander("Supporting points (grounding)"):
            for item in result.grounding.supported_points:
                st.write(f"- {item}")

        if result.grounding.notes:
            st.subheader("Grounding notes")
            for item in result.grounding.notes:
                st.write(f"- {item}")

        with st.expander("Raw evaluation JSON"):
            st.json(ev)


if __name__ == "__main__":
    main()
