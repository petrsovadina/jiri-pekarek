"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { intl } from "@/lib/i18n"
import { Navigation } from "@/components/Navigation"
import { Footer } from "@/components/Footer"

export default function HelpPage() {
  const faqItems = [
    {
      question: "app.faq.question1",
      answer: "app.faq.answer1",
    },
    {
      question: "app.faq.question2",
      answer: "app.faq.answer2",
    },
    {
      question: "app.faq.question3",
      answer: "app.faq.answer3",
    },
    {
      question: "app.faq.question4",
      answer: "app.faq.answer4",
    },
    {
      question: "app.faq.question5",
      answer: "app.faq.answer5",
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-grow container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">{intl.formatMessage({ id: "app.help" })}</h1>
        <Card>
          <CardHeader>
            <CardTitle>{intl.formatMessage({ id: "app.faq" })}</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{intl.formatMessage({ id: item.question })}</AccordionTrigger>
                  <AccordionContent>{intl.formatMessage({ id: item.answer })}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

