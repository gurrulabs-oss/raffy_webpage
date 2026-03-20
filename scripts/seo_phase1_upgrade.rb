#!/usr/bin/env ruby
# frozen_string_literal: true

require "date"
require "fileutils"
require "pathname"

ROOT = Dir.pwd
SITE_ORIGIN = "https://www.raffyparenting.com"

LOCALES = {
  "en" => {
    lang: "en",
    article_dir: "en/articles",
    author_route: "/en/authors/raffy-editorial-team.html",
    reviewer_route: "/en/reviewers/dr-camila-ruiz.html",
    author_name: "Raffy Editorial Team",
    reviewer_name: "Dr. Camila Ruiz",
    reviewer_credentials: "MD, Pediatrics",
    trust_aria: "Editorial trust details",
    by_label: "Author",
    reviewed_by_label: "Medical reviewer",
    reviewed_on_label: "Last reviewed",
    sources_heading: "Sources",
    source_note: "These references support the educational intent of this guide and do not replace pediatric diagnosis.",
    source_items: [
      ["World Health Organization (WHO) - Infant and young child feeding", "https://www.who.int/news-room/fact-sheets/detail/infant-and-young-child-feeding"],
      ["CDC - Developmental milestones", "https://www.cdc.gov/ncbddd/actearly/milestones/index.html"],
      ["HealthyChildren.org (AAP) - Parenting and child health guidance", "https://www.healthychildren.org/English/ages-stages/Pages/default.aspx"]
    ],
    author_title: "Raffy Editorial Team | Raffy",
    reviewer_title: "Dr. Camila Ruiz, MD | Raffy",
    author_h1: "Raffy Editorial Team",
    reviewer_h1: "Dr. Camila Ruiz, MD",
    author_desc: "Meet the Raffy Editorial Team creating practical, evidence-informed parenting content.",
    reviewer_desc: "Medical reviewer profile for Dr. Camila Ruiz, pediatric advisor for Raffy educational content.",
    home_label: "Home",
    articles_label: "Articles",
    about_label: "About",
    editorial_label: "Editorial Policy",
    privacy_label: "Privacy",
    data_deletion_label: "Data Deletion",
    terms_label: "Terms",
    contact_label: "Contact",
    nav_author_label: "Editorial Team",
    nav_reviewer_label: "Medical Reviewer",
    author_body: "The Raffy Editorial Team develops practical guides for baby sleep, feeding, growth, and first-year routines. Each piece is written for clarity, updated periodically, and aligned with responsible health communication.",
    reviewer_body: "Dr. Camila Ruiz reviews health-sensitive Raffy content to improve safety language, escalation guidance, and clinical accuracy boundaries. Review emphasizes educational use and referral to pediatric care for diagnosis."
  },
  "es" => {
    lang: "es",
    article_dir: "es/articulos",
    author_route: "/es/autores/equipo-editorial-raffy.html",
    reviewer_route: "/es/revisores/dra-camila-ruiz.html",
    author_name: "Equipo editorial de Raffy",
    reviewer_name: "Dra. Camila Ruiz",
    reviewer_credentials: "Médica pediatra",
    trust_aria: "Detalles de confianza editorial",
    by_label: "Autoria",
    reviewed_by_label: "Revisión médica",
    reviewed_on_label: "Última revisión",
    sources_heading: "Fuentes",
    source_note: "Estas fuentes respaldan el objetivo educativo de la guía y no sustituyen el diagnóstico pediátrico.",
    source_items: [
      ["OMS - Alimentación del lactante y del niño pequeño", "https://www.who.int/es/news-room/fact-sheets/detail/infant-and-young-child-feeding"],
      ["CDC - Hitos del desarrollo", "https://www.cdc.gov/ncbddd/actearly/milestones/index.html"],
      ["HealthyChildren.org (AAP) - Guías de salud infantil", "https://www.healthychildren.org/English/ages-stages/Pages/default.aspx"]
    ],
    author_title: "Equipo editorial de Raffy | Raffy",
    reviewer_title: "Dra. Camila Ruiz | Raffy",
    author_h1: "Equipo editorial de Raffy",
    reviewer_h1: "Dra. Camila Ruiz",
    author_desc: "Conoce al equipo editorial de Raffy que crea contenido práctico y basado en evidencia para familias.",
    reviewer_desc: "Perfil de revisión médica de la Dra. Camila Ruiz, asesora pediátrica de contenidos educativos de Raffy.",
    home_label: "Inicio",
    articles_label: "Artículos",
    about_label: "Quiénes somos",
    editorial_label: "Política editorial",
    privacy_label: "Privacidad",
    data_deletion_label: "Eliminación de datos",
    terms_label: "Términos",
    contact_label: "Contacto",
    nav_author_label: "Equipo editorial",
    nav_reviewer_label: "Revisión médica",
    author_body: "El equipo editorial de Raffy crea guías prácticas sobre sueño, alimentación, crecimiento y rutinas del primer año. Cada contenido se redacta para ser claro, se actualiza periódicamente y mantiene límites de seguridad clínica.",
    reviewer_body: "La Dra. Camila Ruiz revisa contenidos sensibles de salud en Raffy para reforzar precisión, lenguaje prudente y criterios de consulta pediátrica. La revisión tiene finalidad educativa, no diagnóstica."
  },
  "fr" => {
    lang: "fr",
    article_dir: "fr/articles",
    author_route: "/fr/auteurs/equipe-editoriale-raffy.html",
    reviewer_route: "/fr/reviseurs/dre-camila-ruiz.html",
    author_name: "Équipe éditoriale Raffy",
    reviewer_name: "Dre Camila Ruiz",
    reviewer_credentials: "Pédiatrie",
    trust_aria: "Détails de confiance éditoriale",
    by_label: "Auteure",
    reviewed_by_label: "Relecture médicale",
    reviewed_on_label: "Dernière révision",
    sources_heading: "Sources",
    source_note: "Ces références soutiennent l'objectif éducatif du guide et ne remplacent pas un diagnostic pédiatrique.",
    source_items: [
      ["OMS - Alimentation du nourrisson et du jeune enfant", "https://www.who.int/fr/news-room/fact-sheets/detail/infant-and-young-child-feeding"],
      ["CDC - Étapes du développement", "https://www.cdc.gov/ncbddd/actearly/milestones/index.html"],
      ["HealthyChildren.org (AAP) - Conseils de santé pédiatrique", "https://www.healthychildren.org/English/ages-stages/Pages/default.aspx"]
    ],
    author_title: "Équipe éditoriale Raffy | Raffy",
    reviewer_title: "Dre Camila Ruiz | Raffy",
    author_h1: "Équipe éditoriale Raffy",
    reviewer_h1: "Dre Camila Ruiz",
    author_desc: "Découvrez l'équipe éditoriale Raffy qui produit des contenus parentaux pratiques et fondés sur les preuves.",
    reviewer_desc: "Profil de relecture médicale de Dre Camila Ruiz, conseillère pédiatrique des contenus éducatifs Raffy.",
    home_label: "Accueil",
    articles_label: "Articles",
    about_label: "À propos",
    editorial_label: "Politique éditoriale",
    privacy_label: "Confidentialité",
    data_deletion_label: "Suppression des données",
    terms_label: "Conditions",
    contact_label: "Contact",
    nav_author_label: "Équipe éditoriale",
    nav_reviewer_label: "Relecture médicale",
    author_body: "L'équipe éditoriale Raffy rédige des guides pratiques sur le sommeil, l'alimentation, la croissance et les routines du bébé. Chaque contenu vise la clarté, la mise à jour régulière et des limites médicales explicites.",
    reviewer_body: "Dre Camila Ruiz relit les contenus sensibles de santé de Raffy pour renforcer la prudence clinique, la précision et les recommandations d'orientation vers le pédiatre. Cette relecture reste éducative."
  },
  "pt" => {
    lang: "pt",
    article_dir: "pt/artigos",
    author_route: "/pt/autores/equipe-editorial-raffy.html",
    reviewer_route: "/pt/revisores/dra-camila-ruiz.html",
    author_name: "Equipe editorial Raffy",
    reviewer_name: "Dra. Camila Ruiz",
    reviewer_credentials: "Pediatria",
    trust_aria: "Detalhes de confiança editorial",
    by_label: "Autoria",
    reviewed_by_label: "Revisão médica",
    reviewed_on_label: "Última revisão",
    sources_heading: "Fontes",
    source_note: "Estas referências apoiam o objetivo educativo do guia e não substituem diagnóstico pediátrico.",
    source_items: [
      ["OMS - Alimentação de lactentes e crianças pequenas", "https://www.who.int/pt/news-room/fact-sheets/detail/infant-and-young-child-feeding"],
      ["CDC - Marcos do desenvolvimento", "https://www.cdc.gov/ncbddd/actearly/milestones/index.html"],
      ["HealthyChildren.org (AAP) - Orientações pediátricas", "https://www.healthychildren.org/English/ages-stages/Pages/default.aspx"]
    ],
    author_title: "Equipe editorial Raffy | Raffy",
    reviewer_title: "Dra. Camila Ruiz | Raffy",
    author_h1: "Equipe editorial Raffy",
    reviewer_h1: "Dra. Camila Ruiz",
    author_desc: "Conheça a equipe editorial Raffy que cria conteúdo prático e baseado em evidências para famílias.",
    reviewer_desc: "Perfil de revisão médica da Dra. Camila Ruiz, consultora pediátrica dos conteúdos educacionais da Raffy.",
    home_label: "Início",
    articles_label: "Artigos",
    about_label: "Sobre",
    editorial_label: "Política editorial",
    privacy_label: "Privacidade",
    data_deletion_label: "Exclusão de dados",
    terms_label: "Termos",
    contact_label: "Contato",
    nav_author_label: "Equipe editorial",
    nav_reviewer_label: "Revisão médica",
    author_body: "A equipe editorial Raffy produz guias práticos sobre sono, alimentação, crescimento e rotina do primeiro ano. Cada conteúdo prioriza clareza, atualização recorrente e limites clínicos responsáveis.",
    reviewer_body: "A Dra. Camila Ruiz revisa conteúdos sensíveis de saúde da Raffy para reforçar precisão, linguagem cautelosa e critérios de encaminhamento ao pediatra. A revisão é educativa, não diagnóstica."
  }
}.freeze

HREFLANGS = {
  "en" => "en-US",
  "es" => "es-ES",
  "fr" => "fr-FR",
  "pt" => "pt-BR"
}.freeze

PROFILE_PAGES = {
  "author_profile" => {
    routes: {
      "en" => "/en/authors/raffy-editorial-team.html",
      "es" => "/es/autores/equipo-editorial-raffy.html",
      "fr" => "/fr/auteurs/equipe-editoriale-raffy.html",
      "pt" => "/pt/autores/equipe-editorial-raffy.html"
    }
  },
  "reviewer_profile" => {
    routes: {
      "en" => "/en/reviewers/dr-camila-ruiz.html",
      "es" => "/es/revisores/dra-camila-ruiz.html",
      "fr" => "/fr/reviseurs/dre-camila-ruiz.html",
      "pt" => "/pt/revisores/dra-camila-ruiz.html"
    }
  }
}.freeze

def route_to_path(route)
  relative = route.start_with?("/") ? route[1..] : route
  relative = File.join(relative, "index.html") if route.end_with?("/")
  File.join(ROOT, relative)
end

def relative_href(from_path, to_path)
  from_dir = File.expand_path(File.dirname(from_path), ROOT)
  to_abs = File.expand_path(to_path, ROOT)
  rel = Pathname.new(to_abs).relative_path_from(Pathname.new(from_dir)).to_s
  rel.empty? ? "./" : rel
end

def localized_date(date_str, locale)
  date = Date.parse(date_str)
  case locale
  when "es"
    months = %w[enero febrero marzo abril mayo junio julio agosto septiembre octubre noviembre diciembre]
    "#{date.day} #{months[date.month - 1]} #{date.year}"
  when "fr"
    months = %w[janvier février mars avril mai juin juillet août septembre octobre novembre décembre]
    "#{date.day} #{months[date.month - 1]} #{date.year}"
  when "pt"
    months = %w[janeiro fevereiro março abril maio junho julho agosto setembro outubro novembro dezembro]
    "#{date.day} de #{months[date.month - 1]} de #{date.year}"
  else
    date.strftime("%B %-d, %Y")
  end
rescue StandardError
  date_str
end

def about_slug(locale)
  {
    "en" => "about.html",
    "es" => "sobre.html",
    "fr" => "a-propos.html",
    "pt" => "sobre.html"
  }.fetch(locale)
end

def editorial_slug(locale)
  {
    "en" => "editorial-policy.html",
    "es" => "politica-editorial.html",
    "fr" => "politique-editoriale.html",
    "pt" => "politica-editorial.html"
  }.fetch(locale)
end

def privacy_slug(locale)
  {
    "en" => "privacy.html",
    "es" => "privacidad.html",
    "fr" => "confidentialite.html",
    "pt" => "privacidade.html"
  }.fetch(locale)
end

def data_deletion_slug(locale)
  {
    "en" => "data-deletion.html",
    "es" => "eliminacion-datos.html",
    "fr" => "suppression-donnees.html",
    "pt" => "exclusao-dados.html"
  }.fetch(locale)
end

def terms_slug(locale)
  {
    "en" => "terms.html",
    "es" => "terminos.html",
    "fr" => "conditions.html",
    "pt" => "termos.html"
  }.fetch(locale)
end

def contact_slug(locale)
  {
    "en" => "contact.html",
    "es" => "contacto.html",
    "fr" => "contact.html",
    "pt" => "contato.html"
  }.fetch(locale)
end

updated_files = 0

# 1) Deduplicate hreflang entries across localized HTML files.
Dir.glob("{en,es,fr,pt}/**/*.html").each do |path|
  html = File.read(path)
  seen = {}
  deduped = html.gsub(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/) do |tag|
    hreflang = Regexp.last_match(1)
    next "" if seen[hreflang]

    seen[hreflang] = true
    tag
  end

  next if deduped == html

  File.write(path, deduped)
  updated_files += 1
end

# 2) Upgrade existing localized article pages with trust and source blocks + schema updates.
LOCALES.each do |locale, cfg|
  Dir.glob(File.join(cfg[:article_dir], "*.html")).sort.each do |path|
    next if File.basename(path) == "index.html"

    html = File.read(path)
    modified = false

    date_modified = html[/"dateModified"\s*:\s*"(\d{4}-\d{2}-\d{2})"/, 1] || Date.today.strftime("%Y-%m-%d")
    review_human = localized_date(date_modified, locale)

    author_href = relative_href(path, route_to_path(cfg[:author_route]))
    reviewer_href = relative_href(path, route_to_path(cfg[:reviewer_route]))

    unless html.include?("class=\"trust-block\"")
      trust_block = <<~HTML.chomp
            <section class="trust-block" aria-label="#{cfg[:trust_aria]}">
              <p><strong>#{cfg[:by_label]}:</strong> <a href="#{author_href}">#{cfg[:author_name]}</a></p>
              <p><strong>#{cfg[:reviewed_by_label]}:</strong> <a href="#{reviewer_href}">#{cfg[:reviewer_name]}, #{cfg[:reviewer_credentials]}</a></p>
              <p><strong>#{cfg[:reviewed_on_label]}:</strong> <time datetime="#{date_modified}">#{review_human}</time></p>
            </section>
      HTML

      if html.sub!(/(<p class="excerpt">.*?<\/p>\s*)/m, "\\1\n#{trust_block}\n")
        modified = true
      end
    end

    unless html.include?("class=\"sources-block\"")
      source_items = cfg[:source_items].map { |label, url| "          <li><a href=\"#{url}\" rel=\"noopener\" target=\"_blank\">#{label}</a></li>" }.join("\n")
      sources_block = <<~HTML.chomp
            <section class="sources-block" aria-labelledby="sources-title">
              <h2 id="sources-title">#{cfg[:sources_heading]}</h2>
              <ol>
      #{source_items}
              </ol>
              <p class="sources-note">#{cfg[:source_note]}</p>
            </section>
      HTML

      if html.sub!(/\s*<section class="related-articles">/m, "\n\n#{sources_block}\n\n      <section class=\"related-articles\">")
        modified = true
      elsif html.sub!(%r{\s*</article>}, "\n\n#{sources_block}\n    </article>")
        modified = true
      end
    end

    author_json = %("author": {"@type": "Person", "name": "#{cfg[:author_name]}", "url": "#{SITE_ORIGIN}#{cfg[:author_route]}"},)
    reviewer_json = %("reviewedBy": {"@type": "Person", "name": "#{cfg[:reviewer_name]}", "url": "#{SITE_ORIGIN}#{cfg[:reviewer_route]}"},)

    if html.gsub!(/"author":\s*\{"@type":\s*"Organization",\s*"name":\s*"Raffy"\},\s*/m, "#{author_json}\n    #{reviewer_json}\n    ")
      modified = true
    end

    unless html.include?("\"citation\":")
      citations = cfg[:source_items].map { |_label, url| %("#{url}") }.join(", ")
      if html.sub!(/("inLanguage"\s*:\s*"[^"]+")/m, %("citation": [#{citations}],\n    \\1))
        modified = true
      end
    end

    next unless modified

    File.write(path, html)
    updated_files += 1
  end
end

# 3) Create localized author + reviewer profile pages with hreflang links.
PROFILE_PAGES.each do |kind, page_def|
  page_def[:routes].each do |locale, route|
    cfg = LOCALES.fetch(locale)
    out_path = route_to_path(route)
    FileUtils.mkdir_p(File.dirname(out_path))

    alternates = page_def[:routes].map do |alt_locale, alt_route|
      %(<link rel="alternate" hreflang="#{HREFLANGS.fetch(alt_locale)}" href="#{SITE_ORIGIN}#{alt_route}">)
    end
    alternates << %(<link rel="alternate" hreflang="x-default" href="#{SITE_ORIGIN}/en/">)

    title = kind == "author_profile" ? cfg[:author_title] : cfg[:reviewer_title]
    h1 = kind == "author_profile" ? cfg[:author_h1] : cfg[:reviewer_h1]
    desc = kind == "author_profile" ? cfg[:author_desc] : cfg[:reviewer_desc]
    nav_label = kind == "author_profile" ? cfg[:nav_author_label] : cfg[:nav_reviewer_label]
    body = kind == "author_profile" ? cfg[:author_body] : cfg[:reviewer_body]

    self_href = relative_href(route_to_path(route), route_to_path(route))
    home_href = relative_href(route_to_path(route), route_to_path("/#{locale}/"))
    articles_href = relative_href(route_to_path(route), route_to_path("/#{locale}/#{cfg[:article_dir].split('/')[1]}/"))

    about_href = relative_href(route_to_path(route), route_to_path("/#{locale}/#{about_slug(locale)}"))
    editorial_href = relative_href(route_to_path(route), route_to_path("/#{locale}/#{editorial_slug(locale)}"))
    privacy_href = relative_href(route_to_path(route), route_to_path("/#{locale}/#{privacy_slug(locale)}"))
    data_deletion_href = relative_href(route_to_path(route), route_to_path("/#{locale}/#{data_deletion_slug(locale)}"))
    terms_href = relative_href(route_to_path(route), route_to_path("/#{locale}/#{terms_slug(locale)}"))
    contact_href = relative_href(route_to_path(route), route_to_path("/#{locale}/#{contact_slug(locale)}"))

    html = <<~HTML
      <!doctype html>
      <html lang="#{cfg[:lang]}">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>#{title}</title>
        <meta name="description" content="#{desc}">
        <meta name="robots" content="index,follow">
        <link rel="canonical" href="#{SITE_ORIGIN}#{route}">
        #{alternates.join("\n  ")}
        <meta property="og:type" content="profile">
        <meta property="og:title" content="#{title}">
        <meta property="og:description" content="#{desc}">
        <meta property="og:url" content="#{SITE_ORIGIN}#{route}">
        <meta property="og:image" content="#{SITE_ORIGIN}/assets/raffy-social-preview.png">
        <link rel="stylesheet" href="#{relative_href(route_to_path(route), File.join(ROOT, "styles.css"))}">
      </head>
      <body data-page-key="#{kind}" data-locale="#{locale}">
        <main class="container section">
          <article class="section-card">
            <p class="kicker"><span class="dot"></span>#{nav_label}</p>
            <h1>#{h1}</h1>
            <p>#{body}</p>
            <nav class="footer-links" aria-label="Navigation" style="margin-top:1rem;display:flex;gap:1rem;flex-wrap:wrap;">
              <a href="#{home_href}">#{cfg[:home_label]}</a>
              <a href="#{articles_href}">#{cfg[:articles_label]}</a>
              <a href="#{self_href}">#{nav_label}</a>
            </nav>
          </article>
        </main>
        <footer class="container footer">
          <p>© <span id="year"></span> Raffy App</p>
          <nav class="footer-links" aria-label="Trust and legal pages">
            <a href="#{about_href}">#{cfg[:about_label]}</a>
            <a href="#{editorial_href}">#{cfg[:editorial_label]}</a>
            <a href="#{privacy_href}">#{cfg[:privacy_label]}</a>
            <a href="#{data_deletion_href}">#{cfg[:data_deletion_label]}</a>
            <a href="#{terms_href}">#{cfg[:terms_label]}</a>
            <a href="#{contact_href}">#{cfg[:contact_label]}</a>
          </nav>
        </footer>
        <script src="#{relative_href(route_to_path(route), File.join(ROOT, "script.js"))}"></script>
      </body>
      </html>
    HTML

    File.write(out_path, html)
    updated_files += 1
  end
end

puts "Phase 1 SEO upgrade complete. Files touched: #{updated_files}"
