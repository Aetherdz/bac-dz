import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n";
import { pathFor } from "@/lib/routes";
import { tx } from "@/lib/tx";
import { absolute } from "@/lib/seo";
import { countdownTarget, examSessions } from "@/content/exam-dates";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SectionHeader } from "@/components/ui";
import { JsonLd, faqSchema, softwareAppSchema, webPageSchema } from "@/components/jsonld";
import { CountdownPanel } from "@/components/study/countdown";
import { PomodoroWorkbench } from "@/components/study/pomodoro-workbench";
import { StudyDashboard } from "@/components/study/dashboard";
import { TasksBoard } from "@/components/study/tasks";
import { PageShell } from "./core";
import { IconArrow, IconCalculator, IconCalendar, IconClock, IconLayers, IconTarget } from "@/components/icons";

const faq = {
  countdown: {
    ar: [
      {
        q: "هل تاريخ بكالوريا 2027 معلن رسميًا؟",
        a: "لا. حتى آخر تحقق في 15 نوفمبر 2026 لم يُنشر أي تاريخ رسمي لدورة 2027. لذلك يعمل العدّاد على موعد تقديري موسوم بوضوح، ويُستبدل تلقائيًا بالتاريخ الرسمي فور نشره.",
      },
      {
        q: "كيف يُحسب الموعد التقديري؟",
        a: "بقاعدة معلنة: الدورات الأخيرة تفتح يوم أحد في النصف الأول من جوان، على الساعة 08:00 بتوقيت الجزائر. أول أحد من جوان 2027 هو 6 جوان. الموعد تقديري وليس رسميًا، ويُعرض دائمًا بوسم «تقديري» حتى لا يُخلط بالموعد الرسمي.",
      },
      {
        q: "هل أحتاج إلى حساب أو بيانات شخصية؟",
        a: "لا. العدّاد لا يطلب اسمًا ولا بريدًا ولا معدلًا، ولا يخزّن أي شيء عنك: يعرض الوقت المتبقي فقط، محسوبًا بتوقيت الجزائر.",
      },
      {
        q: "ماذا يحدث بعد انتهاء العدّاد؟",
        a: "تظهر رسالة بأن الموعد المحسوب مرّ، وننتظر نشر التقويم الرسمي للدورة التالية لتحديث العدّاد.",
      },
    ],
    fr: [
      {
        q: "La date du bac 2027 est-elle officielle ?",
        a: "Non. À la dernière vérification (15 novembre 2026), aucune date officielle n’a été publiée pour 2027. Le compte à rebours tourne donc sur une estimation clairement signalée, remplacée automatiquement par la date officielle dès sa publication.",
      },
      {
        q: "Comment l’estimation est-elle calculée ?",
        a: "Par une règle annoncée : les dernières sessions ouvrent un dimanche de la première quinzaine de juin, à 08:00 heure d’Alger. Le premier dimanche de juin 2027 est le 6 juin. Cette date est estimée, jamais officielle, et toujours étiquetée comme telle.",
      },
      {
        q: "Faut-il un compte ou des données personnelles ?",
        a: "Non. Le compte à rebours ne demande ni nom, ni e-mail, ni moyenne, et ne stocke rien sur vous : il affiche le temps restant, calculé au fuseau d’Alger.",
      },
      {
        q: "Que se passe-t-il après l’échéance ?",
        a: "La page indique que la date calculée est passée ; nous attendons le calendrier officiel de la session suivante.",
      },
    ],
    en: [
      {
        q: "Is the 2027 bac date official?",
        a: "No. As of the last check (15 November 2026) no official date has been published for 2027. The countdown therefore runs on a clearly labelled estimate and switches to the official date automatically once it is published.",
      },
      {
        q: "How is the estimate computed?",
        a: "With a stated rule: recent sessions open on a Sunday in the first half of June, at 08:00 Algiers time. The first Sunday of June 2027 is 6 June. It is an estimate, never official, and always labelled as one.",
      },
      {
        q: "Do I need an account or personal data?",
        a: "No. The countdown asks for no name, email or average, and stores nothing about you: it shows the time left, computed on Algiers time.",
      },
      {
        q: "What happens after the deadline?",
        a: "The page says the computed date has passed, and we wait for the official calendar of the next session.",
      },
    ],
  },
  pomodoro: {
    ar: [
      {
        q: "هل يستمر المؤقت عند الانتقال بين الصفحات؟",
        a: "نعم. المؤقت يعمل على مستوى الموقع كله، ويظهر شريط مصغّر في الأسفل أثناء الجلسة، فلا تتوقف الجلسة عند فتح صفحة أخرى.",
      },
      {
        q: "هل يبقى دقيقًا إذا أغلقت التبويب؟",
        a: "يعتمد المؤقت على توقيت الانتهاء لا على عدّاد تنازلي، لذلك لا ينحرف عند تجميد التبويب. إذا أُغلق الموقع أثناء جلسة، تُحتسب الجلسة مرة واحدة عند العودة.",
      },
      {
        q: "هل أحتاج إلى حساب؟",
        a: "لا. الإعدادات والإحصاءات تُحفظ في متصفحك فقط، ويمكنك مسحها في أي وقت.",
      },
      {
        q: "هل الإشعارات إلزامية؟",
        a: "لا، ولا نطلب إذن المتصفح تلقائيًا. لا يظهر طلب الإذن إلا عندما تضغط زر الطلب بنفسك.",
      },
    ],
    fr: [
      {
        q: "Le minuteur continue-t-il entre les pages ?",
        a: "Oui. Il vit au niveau du site et une barre compacte reste visible pendant la session, donc changer de page n’interrompt rien.",
      },
      {
        q: "Reste-t-il exact si je ferme l’onglet ?",
        a: "Le minuteur stocke l’instant de fin, pas un compteur décrémenté : la mise en veille du navigateur ne le fait pas dériver. Une session interrompue par une fermeture est créditée une seule fois au retour.",
      },
      {
        q: "Faut-il un compte ?",
        a: "Non. Réglages et statistiques restent dans votre navigateur et sont effaçables.",
      },
      {
        q: "Les notifications sont-elles obligatoires ?",
        a: "Non, et nous ne demandons jamais l’autorisation automatiquement : seulement si vous cliquez sur le bouton.",
      },
    ],
    en: [
      {
        q: "Does the timer keep running across pages?",
        a: "Yes. It lives at site level and a compact bar stays visible during the session, so navigating does not interrupt it.",
      },
      {
        q: "Is it still accurate if I close the tab?",
        a: "The timer stores the end instant rather than a decremented counter, so tab suspension cannot make it drift. A session interrupted by closing the site is credited once when you return.",
      },
      {
        q: "Do I need an account?",
        a: "No. Settings and statistics stay in your browser and can be cleared.",
      },
      {
        q: "Are notifications required?",
        a: "No, and we never ask automatically: only when you press the request button.",
      },
    ],
  },
  tasks: {
    ar: [
      {
        q: "أين تُحفظ مهامي؟",
        a: "في متصفحك فقط. لا حساب ولا خادم، ومسح بيانات الموقع يحذف المهام.",
      },
      {
        q: "كيف تُحسب نسبة الإنجاز اليومي؟",
        a: "عدد المهام المكتملة اليوم مقسومًا على عدد مهام اليوم. إن لم تكن هناك مهام تظهر 0% بدل رقم وهمي.",
      },
      {
        q: "هل يمكن ربط مهمة بجلسة تركيز؟",
        a: "نعم عبر مخطط الأسبوع: كل جلسة مخططة تفتح مؤقتًا بالمدة نفسها، ثم تُعلَّم كمكتملة عند إنجازها.",
      },
    ],
    fr: [
      {
        q: "Où sont enregistrées mes tâches ?",
        a: "Uniquement dans votre navigateur. Pas de compte, pas de serveur ; effacer les données du site les supprime.",
      },
      {
        q: "Comment est calculé l’avancement du jour ?",
        a: "Tâches terminées aujourd’hui divisées par les tâches du jour. Sans tâche, l’affichage reste à 0 % plutôt qu’un chiffre inventé.",
      },
      {
        q: "Peut-on lier une tâche à une session de focus ?",
        a: "Oui via le planning hebdomadaire : chaque créneau ouvre un minuteur de la même durée, puis se marque comme fait.",
      },
    ],
    en: [
      {
        q: "Where are my tasks stored?",
        a: "Only in your browser. No account, no server; clearing site data removes them.",
      },
      {
        q: "How is today’s completion computed?",
        a: "Tasks finished today divided by today’s tasks. With no tasks it stays at 0% instead of inventing a number.",
      },
      {
        q: "Can a task be linked to a focus session?",
        a: "Yes, through the weekly planner: each slot opens a timer of the same length, then can be marked done.",
      },
    ],
  },
} as const;

const fmtLong = (iso: string, locale: Locale) =>
  new Intl.DateTimeFormat(locale === "ar" ? "ar-DZ" : locale === "fr" ? "fr-DZ" : "en-GB", {
    dateStyle: "full",
    timeZone: "Africa/Algiers",
  }).format(new Date(iso));

export function CountdownPage({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  const session = examSessions[0];
  const faqItems = [...faq.countdown[locale]];

  return (
    <>
      <PageShell>
        <Breadcrumbs
          locale={locale}
          items={[{ name: tx(locale, { ar: "عدّاد البكالوريا", fr: "Compte à rebours", en: "Bac countdown" }), target: { name: "countdown" } }]}
          label={dict.common.home}
        />
        <SectionHeader
          as="h1"
          eyebrow={tx(locale, { ar: "العدّ التنازلي", fr: "Compte à rebours", en: "Countdown" })}
          title={tx(locale, {
            ar: "كم بقي على البكالوريا؟",
            fr: "Combien de temps reste-t-il avant le bac ?",
            en: "How long is left before the bac?",
          })}
          intro={tx(locale, {
            ar: "عدّاد يعمل كل ثانية بتوقيت الجزائر. ما دام الموعد الرسمي غير منشور، يحسب على موعد تقديري موسوم بوضوح بقاعدة معلنة، ويُستبدل تلقائيًا فور صدور القرار.",
            fr: "Un compte à rebours actualisé chaque seconde, au fuseau d’Alger. Tant que la date officielle n’est pas publiée, il tourne sur une estimation signalée, selon une règle annoncée, et bascule dès la décision officielle.",
            en: "A countdown refreshed every second on Algiers time. Until the official date is published it runs on a clearly labelled estimate, built on a stated rule, and switches as soon as the decision lands.",
          })}
        />

        <CountdownPanel locale={locale} target={countdownTarget(session)} rule={session.estimateRule} note={session.note} variant="page" />

        <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-muted">
          <span>{tx(locale, { ar: "المصدر", fr: "Source", en: "Source" })}: education.gov.dz · ONEC</span>
          <span aria-hidden className="h-3 w-px bg-line-strong" />
          <span className="num">{tx(locale, { ar: "آخر تحقق 2026-11-15", fr: "Vérifié le 2026-11-15", en: "Checked 2026-11-15" })}</span>
        </p>

        <section className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">
              {tx(locale, { ar: "كيف يعمل هذا العدّاد", fr: "Comment fonctionne ce compte à rebours", en: "How this countdown works" })}
            </h2>
            <ol className="mt-4 divide-y divide-line border-y border-line">
              {[
                tx(locale, {
                  ar: "نبحث عن التاريخ في المصادر الرسمية (وزارة التربية الوطنية والديوان الوطني للامتحانات). لا نأخذ تاريخًا من مواقع غير رسمية.",
                  fr: "Nous cherchons la date dans les sources officielles (ministère de l’Éducation nationale, ONEC). Aucune date issue de sites non officiels.",
                  en: "We look the date up in official sources (Ministry of National Education, ONEC). No date from unofficial sites.",
                }),
                tx(locale, {
                  ar: "إن لم يُنشر التاريخ، نشغّل العدّاد على تقدير مبني على قاعدة ظاهرة (أول أحد من جوان، 08:00)، بوسم «تقديري» لا يُخلط بالموعد الرسمي.",
                  fr: "Si la date n’est pas publiée, le compte à rebours tourne sur une estimation fondée sur une règle visible (premier dimanche de juin, 08:00), étiquetée « estimée ».",
                  en: "If the date is not published, the countdown runs on an estimate built on a visible rule (first Sunday of June, 08:00), labelled “estimated”.",
                }),
                tx(locale, {
                  ar: "لا نطلب أي بيانات شخصية: لا حساب، ولا بريد، ولا معدل. العدّاد يعرض الوقت فقط.",
                  fr: "Aucune donnée personnelle demandée : pas de compte, pas d’e-mail, pas de moyenne. Le compte à rebours n’affiche que le temps.",
                  en: "No personal data is requested: no account, no email, no average. The countdown only shows time.",
                }),
                tx(locale, {
                  ar: "كل الحسابات بتوقيت Africa/Algiers، حتى لو كان جهازك مضبوطًا على منطقة أخرى.",
                  fr: "Tous les calculs utilisent Africa/Algiers, même si votre appareil est réglé ailleurs.",
                  en: "All calculations use Africa/Algiers even if your device is set elsewhere.",
                }),
              ].map((item, index) => (
                <li key={item} className="grid grid-cols-[2rem_1fr] gap-3 py-4 text-[13.5px] leading-7 text-ink/85">
                  <span className="num text-[11px] text-muted">0{index + 1}</span>
                  {item}
                </li>
              ))}
            </ol>

            <h2 className="mt-10 font-display text-2xl font-semibold text-ink">
              {tx(locale, { ar: "حالة الدورات", fr: "État des sessions", en: "Session status" })}
            </h2>
            <div className="mt-4 overflow-x-auto">
              <table className="data">
                <thead>
                  <tr>
                    <th>{tx(locale, { ar: "الدورة", fr: "Session", en: "Session" })}</th>
                    <th>{tx(locale, { ar: "الحالة", fr: "Statut", en: "Status" })}</th>
                    <th>{tx(locale, { ar: "آخر تحقق", fr: "Dernière vérification", en: "Last check" })}</th>
                  </tr>
                </thead>
                <tbody>
                  {examSessions.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.label[locale]}</td>
                      <td>
                        <span className={entry.status === "official" ? "text-brand" : "text-muted"}>
                          {entry.status === "official"
                            ? tx(locale, { ar: "معلن", fr: "Annoncée", en: "Announced" })
                            : tx(locale, { ar: "تقديري", fr: "Estimée", en: "Estimated" })}
                        </span>
                      </td>
                      <td className="num">{entry.verifiedOn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="card p-5">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                {tx(locale, { ar: "أدوات مرتبطة", fr: "Outils liés", en: "Related tools" })}
              </h2>
              <ul className="mt-3 divide-y divide-line">
                <RelatedLink locale={locale} href={pathFor(locale, { name: "planner" })} title={dict.nav.planner} text={tx(locale, { ar: "وزّع الأسابيع المتبقية على موادك.", fr: "Répartissez les semaines restantes par matière.", en: "Spread remaining weeks across subjects." })} icon={<IconCalendar size={15} />} />
                <RelatedLink locale={locale} href={pathFor(locale, { name: "pomodoro" })} title={tx(locale, { ar: "مؤقت التركيز", fr: "Minuteur de focus", en: "Focus timer" })} text={tx(locale, { ar: "جلسات 25 دقيقة مع راحات.", fr: "Sessions de 25 minutes avec pauses.", en: "25-minute sessions with breaks." })} icon={<IconClock size={15} />} />
                <RelatedLink locale={locale} href={pathFor(locale, { name: "studySpace" })} title={dict.nav.study} text={tx(locale, { ar: "كل مؤشراتك في لوحة واحدة.", fr: "Tous vos indicateurs sur un seul écran.", en: "All your indicators on one screen." })} icon={<IconTarget size={15} />} />
                <RelatedLink locale={locale} href={pathFor(locale, { name: "exams" })} title={dict.nav.exams} text={tx(locale, { ar: "فهرس المواضيع حسب المادة.", fr: "Index des sujets par matière.", en: "Paper index by subject." })} icon={<IconLayers size={15} />} />
              </ul>
            </div>
          </aside>
        </section>

        <FaqBlock locale={locale} items={faqItems} />
      </PageShell>

      <JsonLd
        data={webPageSchema({
          locale,
          url: absolute(pathFor(locale, { name: "countdown" })),
          name: tx(locale, { ar: "عدّاد البكالوريا", fr: "Compte à rebours du bac", en: "Bac countdown" }),
          description: tx(locale, { ar: "عدّاد مباشر حتى موعد البكالوريا: تاريخ رسمي عند نشره، وتقدير موسوم بقاعدة معلنة قبله.", fr: "Compte à rebours en direct : date officielle dès publication, sinon estimation signalée selon une règle annoncée.", en: "A live countdown: the official date once published, otherwise a labelled estimate built on a stated rule." }),
          updated: "2026-11-15",
        })}
      />
      <JsonLd data={faqSchema(faqItems)} />
    </>
  );
}

export function PomodoroPage({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  const faqItems = [...faq.pomodoro[locale]];

  return (
    <>
      <PageShell>
        <Breadcrumbs
          locale={locale}
          items={[{ name: tx(locale, { ar: "مؤقت بومودورو", fr: "Minuteur Pomodoro", en: "Pomodoro timer" }), target: { name: "pomodoro" } }]}
          label={dict.common.home}
        />
        <SectionHeader
          as="h1"
          eyebrow={tx(locale, { ar: "تركيز", fr: "Concentration", en: "Focus" })}
          title={tx(locale, { ar: "مؤقت بومودورو للمراجعة", fr: "Minuteur Pomodoro pour réviser", en: "Pomodoro timer for revision" })}
          intro={tx(locale, {
            ar: "جلسة تركيز، راحة قصيرة، وتكرار. المؤقت يعمل خلال تنقّلك بين صفحات الموقع، ويُحفظ في متصفحك دون حساب.",
            fr: "Une session de focus, une pause courte, et on recommence. Le minuteur survit à la navigation et reste dans votre navigateur, sans compte.",
            en: "A focus session, a short break, repeat. The timer survives navigation and stays in your browser, with no account.",
          })}
        />

        <PomodoroWorkbench locale={locale} />

        <section className="mt-14 grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">
              {tx(locale, { ar: "لماذا 25 دقيقة؟", fr: "Pourquoi 25 minutes ?", en: "Why 25 minutes?" })}
            </h2>
            <p className="mt-3 max-w-prose text-[14px] leading-7 text-muted">
              {tx(locale, {
                ar: "الطريقة التي وصفها فرانشيسكو سيريلو تقوم على تقسيم العمل إلى كتل قصيرة ومحددة، مع راحة تفصل بينها. القيمة ليست في الرقم 25 نفسه، بل في أن الكتلة قصيرة بما يكفي لتبدأ بها الآن، وطويلة بما يكفي لإنجاز جزء حقيقي من الدرس.",
                fr: "La méthode décrite par Francesco Cirillo découpe le travail en blocs courts et délimités, séparés par une pause. La valeur n’est pas dans le nombre 25, mais dans un bloc assez court pour commencer tout de suite et assez long pour avancer réellement.",
                en: "The method described by Francesco Cirillo splits work into short, bounded blocks separated by a break. The value is not the number 25 itself, but a block short enough to start now and long enough to make real progress.",
              })}
            </p>
            <p className="mt-3 max-w-prose text-[14px] leading-7 text-muted">
              {tx(locale, {
                ar: "في المراجعة، عدّل المدة حسب المادة: 50 دقيقة لمسألة رياضيات أو تحليل نص فلسفي، و25 دقيقة لحفظ مفردات أو مراجعة درس قصير. المؤقت يسمح بتعديل كل مدة.",
                fr: "En révision, adaptez la durée à la matière : 50 minutes pour un problème de maths ou une explication de texte, 25 pour du vocabulaire ou une leçon courte. Chaque durée est réglable.",
                en: "When revising, adapt the length to the subject: 50 minutes for a maths problem or a philosophy essay, 25 for vocabulary or a short lesson. Every duration is adjustable.",
              })}
            </p>

            <h2 className="mt-10 font-display text-2xl font-semibold text-ink">
              {tx(locale, { ar: "كيف تستعمل المؤقت بفعالية", fr: "Comment l’utiliser efficacement", en: "How to use it well" })}
            </h2>
            <ol className="mt-4 divide-y divide-line border-y border-line">
              {[
                tx(locale, { ar: "اكتب قبل البدء ما ستنجزه في الكتلة: تمرين محدد، لا «مراجعة الرياضيات».", fr: "Écrivez avant de commencer ce que vous ferez : un exercice précis, pas « réviser les maths ».", en: "Before starting, write what you will finish: a specific exercise, not “revise maths”." }),
                tx(locale, { ar: "أغلق الإشعارات وابقَ في الكتلة. إن خطرت فكرة، دوّنها على ورقة وارجع.", fr: "Coupez les notifications et restez dans le bloc. Une idée surgit ? Notez-la et revenez.", en: "Silence notifications and stay in the block. If an idea appears, note it and return." }),
                tx(locale, { ar: "في الراحة، قف وابتعد عن الشاشة؛ الراحة ليست وقتًا للهاتف.", fr: "Pendant la pause, levez-vous et quittez l’écran ; ce n’est pas un temps de téléphone.", en: "In the break, stand up and leave the screen; it is not phone time." }),
                tx(locale, { ar: "بعد أربع كتل، خذ راحة طويلة. الجلسات المكتملة تُحتسب في لوحة فضاء المراجعة.", fr: "Après quatre blocs, prenez une pause longue. Les sessions terminées alimentent le tableau de bord.", en: "After four blocks, take a long break. Completed sessions feed the dashboard." }),
              ].map((item, index) => (
                <li key={item} className="grid grid-cols-[2rem_1fr] gap-3 py-4 text-[13.5px] leading-7 text-ink/85">
                  <span className="num text-[11px] text-muted">0{index + 1}</span>
                  {item}
                </li>
              ))}
            </ol>
          </div>

          <aside className="space-y-4">
            <div className="card p-5">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                {tx(locale, { ar: "صمّم جلستك", fr: "Calibrez vos sessions", en: "Calibrate your sessions" })}
              </h2>
              <p className="mt-2 text-[12.5px] leading-6 text-muted">
                {tx(locale, {
                  ar: "الافتراضي 25/5، وراحة طويلة كل 4 جلسات. عدّل المدد من لوحة الإعدادات دون فقدان إحصاءاتك.",
                  fr: "Par défaut 25/5, avec une pause longue toutes les 4 sessions. Modifiez les durées sans perdre vos statistiques.",
                  en: "Defaults are 25/5 with a long break every 4 sessions. Change durations without losing your statistics.",
                })}
              </p>
            </div>
            <div className="card p-5">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                {tx(locale, { ar: "انتقل إلى", fr: "Aller à", en: "Go to" })}
              </h2>
              <ul className="mt-3 divide-y divide-line">
                <RelatedLink locale={locale} href={pathFor(locale, { name: "studySpace" })} title={dict.nav.study} text={tx(locale, { ar: "جلساتك ودقائقك وتقدّمك.", fr: "Vos sessions, minutes et progrès.", en: "Your sessions, minutes and progress." })} icon={<IconTarget size={15} />} />
                <RelatedLink locale={locale} href={pathFor(locale, { name: "planner" })} title={dict.nav.planner} text={tx(locale, { ar: "جدول أسبوعي يفتح المؤقت.", fr: "Un planning qui lance le minuteur.", en: "A weekly plan that starts the timer." })} icon={<IconCalendar size={15} />} />
                <RelatedLink locale={locale} href={pathFor(locale, { name: "countdown" })} title={tx(locale, { ar: "عدّاد البكالوريا", fr: "Compte à rebours", en: "Bac countdown" })} text={tx(locale, { ar: "ما بقي حتى الامتحان.", fr: "Ce qu’il reste avant l’examen.", en: "What is left before the exam." })} icon={<IconClock size={15} />} />
              </ul>
            </div>
          </aside>
        </section>

        <FaqBlock locale={locale} items={faqItems} />
      </PageShell>

      <JsonLd
        data={softwareAppSchema({
          locale,
          name: tx(locale, { ar: "مؤقت بومودورو", fr: "Minuteur Pomodoro", en: "Pomodoro timer" }),
          description: tx(locale, { ar: "مؤقت تركيز يعمل في المتصفح مع إحصاءات محلية.", fr: "Minuteur de concentration avec statistiques locales.", en: "A browser focus timer with local statistics." }),
          url: absolute(pathFor(locale, { name: "pomodoro" })),
        })}
      />
      <JsonLd data={faqSchema(faqItems)} />
    </>
  );
}

export function StudySpacePage({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  const session = examSessions[0];

  return (
    <>
      <PageShell>
        <Breadcrumbs
          locale={locale}
          items={[{ name: dict.nav.study, target: { name: "studySpace" } }]}
          label={dict.common.home}
        />
        <SectionHeader
          as="h1"
          eyebrow={tx(locale, { ar: "لوحتك", fr: "Votre tableau", en: "Your board" })}
          title={tx(locale, { ar: "فضاء المراجعة", fr: "Mon espace d’étude", en: "My study space" })}
          intro={tx(locale, {
            ar: "ما أنجزته اليوم، وما بقي، وما تقترحه الخطوة التالية. كل شيء محلي، ويعمل دون حساب.",
            fr: "Ce que vous avez fait aujourd’hui, ce qui reste, et la prochaine étape. Tout est local et fonctionne sans compte.",
            en: "What you did today, what remains, and the next step. Everything is local and works without an account.",
          })}
        />

        <StudyDashboard locale={locale} target={countdownTarget(session)} note={session.note} />

        <section className="mt-14 max-w-3xl">
          <h2 className="font-display text-2xl font-semibold text-ink">
            {tx(locale, { ar: "كيف تُقرأ هذه الأرقام", fr: "Comment lire ces chiffres", en: "How to read these numbers" })}
          </h2>
          <div className="mt-4 space-y-4 text-[14px] leading-7 text-muted">
            <p>
              {tx(locale, {
                ar: "«جلسات اليوم» هي جلسات التركيز المكتملة فقط، لا المؤقتات التي أُوقفت في المنتصف. «دقائق الدراسة» مجموع مدة تلك الجلسات المكتملة.",
                fr: "« Sessions du jour » ne compte que les sessions de focus terminées, pas les minuteurs interrompus. « Minutes d’étude » additionne leur durée.",
                en: "“Sessions today” counts only completed focus sessions, not timers stopped halfway. “Study minutes” adds up their duration.",
              })}
            </p>
            <p>
              {tx(locale, {
                ar: "«سلسلة الأيام» تعني أيامًا متتالية فيها نشاط مسجّل. لا نضيف أيامًا وهمية، وإن انقطعت يومًا تبدأ السلسلة من جديد.",
                fr: "La « série » représente des jours consécutifs avec une activité enregistrée. Aucun jour n’est inventé ; une journée vide remet le compteur à zéro.",
                en: "The “streak” is consecutive days with recorded activity. No day is invented; an empty day resets it.",
              })}
            </p>
            <p>
              {tx(locale, {
                ar: "إذا استعملت جهازًا آخر أو مسحت بيانات المتصفح، تبدأ الأرقام من الصفر لأن الحفظ محلي بالكامل.",
                fr: "Sur un autre appareil, ou après effacement des données du navigateur, les chiffres repartent de zéro : le stockage est entièrement local.",
                en: "On another device, or after clearing browser data, the numbers restart from zero because storage is entirely local.",
              })}
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Link
              href={pathFor(locale, { name: "tasks" })}
              className="btn btn-sm min-h-11 w-full justify-between px-3 active:bg-raised sm:min-h-9 sm:w-auto sm:justify-center"
            >
              {tx(locale, { ar: "مهام اليوم", fr: "Tâches du jour", en: "Today’s tasks" })}
              <IconArrow size={14} />
            </Link>
            <Link
              href={pathFor(locale, { name: "calculator" })}
              className="btn btn-sm min-h-11 w-full justify-start px-3 active:bg-raised sm:min-h-9 sm:w-auto sm:justify-center"
            >
              <IconCalculator size={14} />
              {dict.nav.calculator}
            </Link>
            <Link
              href={pathFor(locale, { name: "exams" })}
              className="btn btn-sm min-h-11 w-full justify-start px-3 active:bg-raised sm:min-h-9 sm:w-auto sm:justify-center"
            >
              <IconLayers size={14} />
              {dict.nav.exams}
            </Link>
          </div>
        </section>
      </PageShell>

      <JsonLd
        data={webPageSchema({
          locale,
          url: absolute(pathFor(locale, { name: "studySpace" })),
          name: tx(locale, { ar: "فضاء المراجعة", fr: "Mon espace d’étude", en: "My study space" }),
          description: tx(locale, { ar: "لوحة متابعة الدراسة اليومية.", fr: "Tableau de bord quotidien.", en: "Daily study dashboard." }),
        })}
      />
    </>
  );
}

export function TasksPage({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  const faqItems = [...faq.tasks[locale]];

  return (
    <>
      <PageShell>
        <Breadcrumbs
          locale={locale}
          items={[{ name: tx(locale, { ar: "مهام الدراسة", fr: "Tâches d’étude", en: "Study tasks" }), target: { name: "tasks" } }]}
          label={dict.common.home}
        />
        <SectionHeader
          as="h1"
          eyebrow={tx(locale, { ar: "تنظيم", fr: "Organisation", en: "Organisation" })}
          title={tx(locale, { ar: "مهام الدراسة اليومية", fr: "Tâches d’étude du jour", en: "Today’s study tasks" })}
          intro={tx(locale, {
            ar: "قائمة قصيرة تُنجز فعليًا أفضل من خطة طويلة لا تنتهي. أضف المهمة، حدّد مدتها، وأنهِها واحدة واحدة.",
            fr: "Une courte liste réellement terminée vaut mieux qu’un long plan inachevé. Ajoutez, estimez, terminez une par une.",
            en: "A short list actually finished beats a long plan left undone. Add, estimate, finish one at a time.",
          })}
        />

        <TasksBoard locale={locale} />

        <section className="mt-14 max-w-3xl">
          <h2 className="font-display text-2xl font-semibold text-ink">
            {tx(locale, { ar: "ثلاث قواعد في إدارة المهام", fr: "Trois règles de gestion des tâches", en: "Three rules for task management" })}
          </h2>
          <ul className="mt-4 space-y-4 text-[14px] leading-7 text-muted">
            <li>
              {tx(locale, {
                ar: "اجعل المهمة قابلة للإنهاء: «حل 6 تمارين من سلسلة النهايات» أفضل من «مراجعة الرياضيات».",
                fr: "Rendez la tâche finissable : « résoudre 6 exercices de la série » plutôt que « réviser les maths ».",
                en: "Make the task finishable: “solve 6 exercises from the sequence” rather than “revise maths”.",
              })}
            </li>
            <li>
              {tx(locale, {
                ar: "قدّر المدة بصدق، ثم قارن التقدير بالواقع. الفارق بينهما هو أهم ما تتعلمه عن طريقة عملك.",
                fr: "Estimez honnêtement, puis comparez à la réalité : l’écart est ce qui vous apprend le plus sur votre façon de travailler.",
                en: "Estimate honestly, then compare with reality: the gap is what teaches you most about how you work.",
              })}
            </li>
            <li>
              {tx(locale, {
                ar: "لا تُضف أكثر من 5 مهام كبيرة في اليوم. المهام الصغيرة يمكن أن تتجاوز ذلك بقليل.",
                fr: "N’ajoutez pas plus de 5 grosses tâches par jour ; quelques petites peuvent s’y ajouter.",
                en: "Do not add more than 5 large tasks a day; a few small ones may be added.",
              })}
            </li>
          </ul>
        </section>

        <FaqBlock locale={locale} items={faqItems} />
      </PageShell>

      <JsonLd
        data={webPageSchema({
          locale,
          url: absolute(pathFor(locale, { name: "tasks" })),
          name: tx(locale, { ar: "مهام الدراسة", fr: "Tâches d’étude", en: "Study tasks" }),
          description: tx(locale, { ar: "مدير مهام محلي لمراجعة البكالوريا.", fr: "Gestionnaire de tâches local pour le bac.", en: "A local task manager for bac revision." }),
        })}
      />
      <JsonLd data={faqSchema(faqItems)} />
    </>
  );
}

function FaqBlock({ locale, items }: { locale: Locale; items: { q: string; a: string }[] }) {
  return (
    <section className="mt-14 max-w-3xl">
      <h2 className="font-display text-2xl font-semibold text-ink">
        {tx(locale, { ar: "أسئلة متكررة", fr: "Questions fréquentes", en: "Frequently asked" })}
      </h2>
      <div className="mt-4 divide-y divide-line border-y border-line">
        {items.map((item) => (
          <details key={item.q} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[14px] font-medium text-ink">
              {item.q}
              <span aria-hidden className="text-muted transition-transform duration-200 group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-2 text-[13.5px] leading-7 text-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function RelatedLink({
  href,
  title,
  text,
  icon,
}: {
  locale: Locale;
  href: string;
  title: string;
  text: string;
  icon: React.ReactNode;
}) {
  return (
    <li>
      <Link href={href} className="group flex items-start gap-2.5 py-3">
        <span className="mt-0.5 text-muted transition-colors group-hover:text-brand">{icon}</span>
        <span>
          <span className="block text-[13px] font-medium text-ink group-hover:text-brand">{title}</span>
          <span className="mt-0.5 block text-[11.5px] leading-5 text-muted">{text}</span>
        </span>
      </Link>
    </li>
  );
}
