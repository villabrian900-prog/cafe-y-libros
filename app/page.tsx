"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CafeYLibrosWebsite() {
  const previousBooks = [
    {
      title: "The Last Thing He Told Me",
      author: "Laura Dave",
      date: "May 2026",
      genre: "Mystery / Thriller",
      image: "https://covers.openlibrary.org/b/id/10571017-L.jpg",
    },
    {
      title: "The Measure",
      author: "Nikki Erlick",
      date: "Apr 2026",
      genre: "Literary / Speculative",
      image: "https://m.media-amazon.com/images/I/91yNb85Z9FL._AC_UF1000,1000_QL80_.jpg",
    },
    {
      title: "Half his Age",
      author: "Jennette McCurdy",
      date: "Mar 2026",
      genre: "Memoir",
      image: "https://m.media-amazon.com/images/I/91dhTPXQpkL.jpg_BO30,255,255,255_UF750,750_SR1910,1000,0,C_QL100_.jpg",
    },
    {
      title: "Love in the Time of Cholera",
      author: "Gabriel García Márquez",
      date: "Feb 2026",
      genre: "Literary Fiction",
      image: "https://covers.openlibrary.org/b/id/10518348-L.jpg",
    },
    {
      title: "Tender is the Flesh",
      author: "Agustina Bazterrica",
      date: "Jan 2026",
      genre: "Dystopian",
      image: "https://covers.openlibrary.org/b/id/10330829-L.jpg",
    },
    {
      title: "All Sinners Bleed",
      author: "S.A. Cosby",
      date: "Dec 2025",
      genre: "Crime",
      image: "https://covers.openlibrary.org/b/id/13478757-L.jpg",
    },
    {
      title: "The Curious Incident of the Dog in the Night-Time",
      author: "Mark Haddon",
      date: "Nov 2025",
      genre: "Mystery",
      image: "https://covers.openlibrary.org/b/id/12473709-L.jpg",
    },
    {
      title: "The Long Walk",
      author: "Stephen King",
      date: "Oct 2025",
      genre: "Dystopian",
      image: "https://covers.openlibrary.org/b/id/14653609-L.jpg",
    },
    {
      title: "The Way of Integrity",
      author: "Martha Beck",
      date: "Sep 2025",
      genre: "Self-help",
      image: "https://covers.openlibrary.org/b/id/10861592-L.jpg",
    },
    {
      title: "Fight Club",
      author: "Chuck Palahniuk",
      date: "Aug 2025",
      genre: "Literary Fiction",
      image: "https://covers.openlibrary.org/b/id/7890578-L.jpg",
    },
  ];

  const [previousPage, setPreviousPage] = useState(0);
  const visiblePreviousBooks = previousBooks.slice(previousPage * 3, previousPage * 3 + 3);

  const genreCounts = previousBooks.reduce<Record<string, number>>((acc, book) => {
    const genre = book.genre || "Other";
    acc[genre] = (acc[genre] || 0) + 1;
    return acc;
  }, {});

  const analyticsItems = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([label, count]) => ({
      label,
      width: `${Math.round((count / previousBooks.length) * 100)}%`,
    }));

  const memberThoughts = [
    {
      quote:
        "A cozy space for deep conversations, coffee, and stories that stay with you long after the last page.",
      name: "Brian",
    },
    {
      quote:
        "Every meeting feels like a literary café adventure across New Jersey.",
      name: "Jorge",
    },
    {
      quote:
        "The discussions here completely changed how I experience books.",
      name: "Ross",
    },
  ];

  const genres = [
    "Mystery",
    "Thriller",
    "Literary Fiction",
    "Romance",
    "Fantasy",
    "Historical Fiction",
  ];

  const defaultRecommendedReads = [
    {
      title: "Shuggie Bain",
      author: "Douglas Stuart",
      image: "https://covers.openlibrary.org/b/id/9271540-S.jpg",
    },
    {
      title: "Never Let Me Go",
      author: "Kazuo Ishiguro",
      image: "https://covers.openlibrary.org/b/id/1047334-S.jpg",
    },
    {
      title: "The Brief Wondrous Life of Oscar Wao",
      author: "Junot Díaz",
      image: "https://covers.openlibrary.org/b/id/12451659-S.jpg",
    },
  ];

  // --- Voting and membership local state (persisted to localStorage) ---
  const [members, setMembers] = useState<any[]>([]);
  const [recommendedReads, setRecommendedReads] = useState<any[]>([]);
  const [recommendTitle, setRecommendTitle] = useState("");
  const [recommendAuthor, setRecommendAuthor] = useState("");
  const [recommendGenre, setRecommendGenre] = useState("");
  const [recommendNotes, setRecommendNotes] = useState("");
  const [recPage, setRecPage] = useState(0);

  const fetchRecommendedReads = async () => {
    const { data, error } = await supabase
      .from("book_recommendations")
      .select("id, book_title, book_author, genre, notes, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load recommended reads:", error);
      return;
    }

    setRecommendedReads(data || []);
  };

  useEffect(() => {
    try {
      const m = localStorage.getItem("cafeylibros_members");
      if (m) setMembers(JSON.parse(m));
    } catch (e) {
      console.error(e);
    }

    fetchRecommendedReads();
  }, []);

  // combined recommendations (defaults first, then DB results)
  const combinedRecommendations = [...defaultRecommendedReads, ...recommendedReads];
  const recPageCount = Math.max(1, Math.ceil(combinedRecommendations.length / 3));
  const visibleRecommendations = combinedRecommendations.slice(recPage * 3, recPage * 3 + 3);

  // auto-advance recommendations every 30s
  useEffect(() => {
    if (combinedRecommendations.length <= 3) return;
    const id = setInterval(() => {
      setRecPage((p) => (p + 1) % Math.ceil(combinedRecommendations.length / 3));
    }, 30000);
    return () => clearInterval(id);
  }, [combinedRecommendations.length]);

  // ensure current page is within bounds when data changes
  useEffect(() => {
    if (recPage >= recPageCount) setRecPage(0);
  }, [recPageCount]);

  // membership form state
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberGenre, setMemberGenre] = useState("");

  async function handleMemberSubmit(
  e: React.FormEvent<HTMLFormElement>
) {
  e.preventDefault();

  if (!memberName.trim() || !memberEmail.trim()) {
    alert("Please provide your name and email.");
    return;
  }

  const { data, error } = await supabase
    .from("members")
    .insert([
      {
        name: memberName.trim(),
        email: memberEmail.trim(),
        favorite_genre: memberGenre.trim(),
      },
    ]);

  if (error) {
    console.error(error);

    if (error.message.includes("duplicate")) {
      alert("This email is already registered.");
    } else {
      alert("Something went wrong.");
    }

    return;
  }

  alert("Welcome to Café y Libros!");

  setMemberName("");
  setMemberEmail("");
  setMemberGenre("");
}

  async function handleRecommendSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!recommendTitle.trim()) {
      alert("Please enter a book title to recommend.");
      return;
    }

    const { error } = await supabase
      .from("book_recommendations")
      .insert([
        {
          book_title: recommendTitle.trim(),
          book_author: recommendAuthor.trim(),
          genre: recommendGenre.trim(),
          notes: recommendNotes.trim(),
        },
      ]);

    if (error) {
      console.error(error);
      alert("Recommendation failed.");
      return;
    }

    alert("Recommendation submitted!");

    setRecommendTitle("");
    setRecommendAuthor("");
    setRecommendGenre("");
    setRecommendNotes("");

    await fetchRecommendedReads();
  }

  return (
    <div className="min-h-screen bg-[#f5efe6] text-[#4b2e1f] font-serif">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1600')] bg-cover bg-center opacity-15"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-[#6f4e37]">
                  <span className="text-3xl">☕</span>
                </div>

                <div>
                  <h1 className="text-5xl font-bold tracking-tight">
                    Café y Libros
                  </h1>
                  <p className="text-lg text-[#6f4e37]">
                    Literary Society
                  </p>
                </div>
              </div>

              <p className="text-xl leading-relaxed mb-8">
                Book lovers. Deep talkers. Café sippers.
                <br />
                A literary society for curious and innovative souls across New
                Jersey.
              </p>

              <div className="flex flex-wrap gap-4">
                <a
                  href="https://www.instagram.com/cafeylibrosls/"
                  target="_blank"
                  className="bg-[#6f4e37] hover:bg-[#5c3f2d] text-white px-6 py-3 rounded-2xl shadow-lg transition"
                >
                  Instagram
                </a>

                <a
                  href="https://fable.co/fabler/jorge-382671359561?tab=stats"
                  target="_blank"
                  className="border-2 border-[#6f4e37] px-6 py-3 rounded-2xl hover:bg-[#eadfce] transition"
                >
                  Join on Fable
                </a>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur rounded-3xl shadow-2xl p-8 border border-[#d7c2a8]">
              <h2 className="text-3xl font-bold mb-4">
                Next Monthly Meetup
              </h2>

              <div className="space-y-2 text-lg">
                <p>
                  <span className="font-semibold">Book:</span>{" "}
                  The Hacienda
                </p>
                <p>
                  <span className="font-semibold">Date:</span> June 2026
                </p>
                <p>
                  <span className="font-semibold">Time:</span> Sunday at 1 PM
                </p>
                <p>
                  <span className="font-semibold">Location:</span> Ayala Coffee, Union, NJ
                </p>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <div className="h-36 w-24 bg-[#f5efe6] rounded-xl shadow-lg flex items-center justify-center overflow-hidden">
                  <img
                    src="https://covers.openlibrary.org/b/id/12748381-M.jpg"
                    alt="The Hacienda cover"
                    className="max-h-full w-auto object-contain"
                  />
                </div>

                <div>
                  <p className="text-sm uppercase tracking-wider text-[#8b5e3c]">
                    Next Read
                  </p>
                  <h3 className="text-2xl font-bold">
                    The Hacienda
                  </h3>
                  <p className="italic">Isabel Cañas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { label: "Total Members", value: "15" },
            { label: "Books Reviewed", value: `${previousBooks.length}` },
            { label: "May Attendance", value: "5" },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-8 shadow-lg border border-[#d8c2ab]"
            >
              <p className="text-4xl font-bold mb-2">{item.value}</p>
              <p className="text-[#7a5b45]">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LAST MEETUP SUMMARY */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-[#f7efe4] rounded-3xl p-10 shadow-xl border border-[#d8c2ab]">
          <p className="text-sm uppercase tracking-[0.3em] text-[#8b5e3c] mb-4">
            Last Meetup Review
          </p>
          <h2 className="text-2xl font-bold mb-3">The Last Thing He Told Me</h2>

          <div className="mb-6 flex flex-col lg:flex-row items-start lg:items-center gap-6">
            <div className="h-56 w-40 overflow-hidden rounded-2xl bg-white shadow-sm border border-[#e1d3c2] flex items-center justify-center">
              <img
                src="https://covers.openlibrary.org/b/id/10571017-L.jpg"
                alt="The Last Thing He Told Me cover"
                className="h-full w-auto object-contain"
              />
            </div>
            <p className="text-base leading-relaxed text-[#5c4a33] max-w-2xl">
              Our last meetup at Ayala Coffee (Union, NJ) had 5 attendees and an average community rating of <strong>2.0</strong>. The discussion flagged pacing and character depth as common notes.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e1d3c2]">
              <p className="text-3xl font-bold">2.0</p>
              <p className="text-sm text-[#7a5b45]">Overall Rating</p>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e1d3c2]">
              <p className="text-3xl font-bold">5</p>
              <p className="text-sm text-[#7a5b45]">Attendees</p>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e1d3c2] col-span-2">
              <p className="text-xl font-bold">Ayala Coffee</p>
              <p className="text-sm text-[#7a5b45]">Union, NJ</p>
            </div>
          </div>

          <p className="text-sm text-[#5c4a33]">Average rating is based only on the books we read, not voting card selections. May attendance reflects the number of members who joined the May meetup.</p>
        </div>
      </section>

      {/* CURRENT BOOK PICKS */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold">Next Month Reads</h2>
            <p className="text-[#6f4e37] mt-2">Suggest reads and prepare for next month's vote.</p>
          </div>
        </div>

        {/* Planning cards */}
        <div className="mb-6">
          <p className="text-sm text-[#6f4e37]">This section is temporary copy until we reopen voting for the next book.</p>
        </div>

        <div className="bg-white rounded-3xl p-10 shadow-xl border border-[#d8c2ab]">
          <p className="text-lg text-[#6f4e37]">
            The Hacienda is confirmed for June, so the May voting slate has been archived. Previous May contenders now appear in the recommended reads section above.
          </p>
        </div>
      </section>

      {/* RECOMMENDED READS */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="bg-white rounded-3xl shadow-xl border border-[#d8c2ab] p-10">
            <h2 className="text-4xl font-bold mb-4">Recommend a Read</h2>
            <p className="text-[#6f4e37] mb-8">
              Share the books you'd like the club to consider for next month. Recommendations are saved to Supabase so the group can track them centrally.
            </p>

            <form onSubmit={handleRecommendSubmit} className="space-y-4">
              <input
                value={recommendTitle}
                onChange={(e) => setRecommendTitle(e.target.value)}
                placeholder="Book title"
                className="w-full px-5 py-4 rounded-2xl border border-[#d8c2ab]"
              />

              <input
                value={recommendAuthor}
                onChange={(e) => setRecommendAuthor(e.target.value)}
                placeholder="Book author"
                className="w-full px-5 py-4 rounded-2xl border border-[#d8c2ab]"
              />

              <input
                value={recommendGenre}
                onChange={(e) => setRecommendGenre(e.target.value)}
                placeholder="Genre"
                className="w-full px-5 py-4 rounded-2xl border border-[#d8c2ab]"
              />

              <textarea
                value={recommendNotes}
                onChange={(e) => setRecommendNotes(e.target.value)}
                placeholder="Why this book?"
                rows={4}
                className="w-full px-5 py-4 rounded-2xl border border-[#d8c2ab] resize-none"
              />

              <button
                type="submit"
                className="bg-[#4b2e1f] text-white px-6 py-4 rounded-2xl shadow-lg hover:bg-[#3a241a] transition"
              >
                Submit Recommendation
              </button>
            </form>
          </div>

          <div>
            <div className="mb-6">
              <h3 className="text-3xl font-bold mb-2">Submitted Recommendations</h3>
              <p className="text-[#6f4e37]">
                This list reflects the books your members want to read next.
              </p>
            </div>

            {combinedRecommendations.length === 0 ? (
              <div className="rounded-3xl border border-[#d8c2ab] bg-white p-8 shadow-lg">
                <p className="text-[#6f4e37]">No recommendations yet. Be the first to suggest a title.</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setRecPage((p) => Math.max(p - 1, 0))}
                      disabled={recPage === 0}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#d8c2ab] bg-white text-[#4b2e1f] disabled:opacity-40"
                    >
                      ←
                    </button>

                    <button
                      type="button"
                      onClick={() => setRecPage((p) => Math.min(p + 1, recPageCount - 1))}
                      disabled={recPage >= recPageCount - 1}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#d8c2ab] bg-white text-[#4b2e1f] disabled:opacity-40"
                    >
                      →
                    </button>
                  </div>

                  <div className="text-sm text-[#6f4e37]">
                    Showing {recPage * 3 + 1}–{Math.min((recPage + 1) * 3, combinedRecommendations.length)} of {combinedRecommendations.length}
                  </div>
                </div>

                <div className="space-y-4">
                  {visibleRecommendations.map((item: any, index: number) => {
                    const title = item.book_title || item.title || "Untitled";
                    const author = item.book_author || item.author || "Unknown author";
                    return (
                      <div key={index} className="rounded-3xl border border-[#d8c2ab] bg-white p-6 shadow-lg">
                        <div className="flex items-start gap-4 mb-3">
                          {item.image ? (
                            <div className="h-16 w-12 overflow-hidden rounded-lg bg-[#f5efe6] flex items-center justify-center">
                              <img src={item.image} alt={`${title} cover`} className="h-full w-auto object-contain" />
                            </div>
                          ) : null}

                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <h4 className="text-xl font-bold">{title}</h4>
                                <p className="italic text-sm text-[#6f4e37]">{author}</p>
                              </div>
                              {item.created_at ? (
                                <p className="text-xs uppercase text-[#8b5e3c]">{new Date(item.created_at).toLocaleDateString()}</p>
                              ) : null}
                            </div>
                            {item.notes ? <p className="text-sm text-[#5c4a33] mt-3">{item.notes}</p> : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* PREVIOUS READS */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-4xl font-bold">Previous Reads</h2>
            <p className="text-[#6f4e37] mt-2">Books we've read at past meetups.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPreviousPage((p) => Math.max(p - 1, 0))}
              disabled={previousPage === 0}
              className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-[#d8c2ab] bg-white text-[#4b2e1f] disabled:opacity-40"
            >
              ←
            </button>
            <span className="text-sm text-[#6f4e37]">
              Showing {previousPage * 3 + 1}–{Math.min((previousPage + 1) * 3, previousBooks.length)} of {previousBooks.length}
            </span>
            <button
              type="button"
              onClick={() => setPreviousPage((p) => Math.min(p + 1, Math.floor((previousBooks.length - 1) / 3)))}
              disabled={(previousPage + 1) * 3 >= previousBooks.length}
              className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-[#d8c2ab] bg-white text-[#4b2e1f] disabled:opacity-40"
            >
              →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {visiblePreviousBooks.map((b, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl overflow-hidden shadow-xl border border-[#d8c2ab]"
            >
              <div className="h-64 bg-[#f5efe6] p-6 flex items-center justify-center overflow-hidden">
                <img src={b.image} alt={`${b.title} cover`} className="max-h-full w-auto object-contain" />
              </div>

              <div className="p-6">
                <h3 className="text-lg font-bold">{b.title}</h3>
                <p className="italic text-sm">{b.author}</p>
                <p className="text-[#8b5e3c] text-sm mt-2">Read: {b.date}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MEMBER THOUGHTS */}
      <section className="bg-[#e8dbc9] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">
            What Members Are Saying
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {memberThoughts.map((thought, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-8 shadow-lg relative"
              >
                <div className="text-6xl absolute top-4 left-6 text-[#d7c2a8]">
                  “
                </div>

                <p className="text-lg leading-relaxed relative z-10 pt-8">
                  {thought.quote}
                </p>

                <p className="mt-6 font-bold text-[#6f4e37]">
                  — {thought.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GENRES */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">
              Genres We've Explored
            </h2>

            <p className="text-lg leading-relaxed mb-8">
              From thrillers and literary fiction to fantasy and romance,
              Café y Libros celebrates stories from every genre.
            </p>

            <div className="flex flex-wrap gap-4">
              {genres.map((genre, index) => (
                <span
                  key={index}
                  className="bg-white border border-[#d7c2a8] px-5 py-3 rounded-full shadow"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8 border border-[#d7c2a8]">
            <h3 className="text-3xl font-bold mb-8">
              Community Analytics
            </h3>

            <div className="space-y-6">
              {analyticsItems.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-2">
                    <span>{item.label}</span>
                    <span>{item.width}</span>
                  </div>

                  <div className="w-full bg-[#eadfce] rounded-full h-4">
                    <div
                      className="bg-[#6f4e37] h-4 rounded-full"
                      style={{ width: item.width }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MEMBER SIGN UP */}
      <section className="bg-[#4b2e1f] text-white py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold mb-6">
            Join Café y Libros
          </h2>

          <p className="text-xl mb-10 text-[#f3e8dc]">
            Become part of a growing literary community exploring books and
            coffee shops throughout New Jersey.
          </p>

          <form onSubmit={handleMemberSubmit} className="grid md:grid-cols-2 gap-4">
            <input
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              placeholder="Full Name"
              className="px-5 py-4 rounded-2xl text-white placeholder-white/70 bg-[#3a2b20]"
            />

            <input
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              placeholder="Email Address"
              className="px-5 py-4 rounded-2xl text-white placeholder-white/70 bg-[#3a2b20]"
            />

            <input
              value={memberGenre}
              onChange={(e) => setMemberGenre(e.target.value)}
              placeholder="Favorite Genre"
              className="px-5 py-4 rounded-2xl text-white placeholder-white/70 bg-[#3a2b20] md:col-span-2"
            />

            <button type="submit" className="bg-[#d7b899] hover:bg-[#c7a785] text-[#4b2e1f] font-bold py-4 rounded-2xl md:col-span-2 transition">
              Become a Member
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#2d1a12] text-[#f3e8dc] py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h3 className="text-2xl font-bold">☕ Café y Libros</h3>
            <p className="text-sm text-[#d6c2af]">
              Literary Society • New Jersey
            </p>
          </div>

          <div className="flex gap-6 text-lg">
            <a
              href="https://www.instagram.com/cafeylibrosls/"
              target="_blank"
              className="hover:text-[#d7b899]"
            >
              Instagram
            </a>

            <a
              href="https://fable.co"
              target="_blank"
              className="hover:text-[#d7b899]"
            >
              Fable
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}