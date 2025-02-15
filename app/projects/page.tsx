"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { intl } from "@/lib/i18n"
import { Navigation } from "@/components/Navigation"
import { Footer } from "@/components/Footer"
import Link from "next/link"

interface Project {
  id: string
  name: string
  lastModified: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    const savedProjects = localStorage.getItem("projects")
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects))
    }
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-grow container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">{intl.formatMessage({ id: "app.projects" })}</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  {intl.formatMessage({ id: "app.lastModified" })}: {new Date(project.lastModified).toLocaleString()}
                </p>
                <Link href={`/project/${project.id}`}>
                  <Button>{intl.formatMessage({ id: "app.openProject" })}</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        {projects.length === 0 && (
          <p className="text-center text-gray-500 mt-8">{intl.formatMessage({ id: "app.noProjects" })}</p>
        )}
        <div className="mt-8">
          <Link href="/">
            <Button>{intl.formatMessage({ id: "app.createNewProject" })}</Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}

