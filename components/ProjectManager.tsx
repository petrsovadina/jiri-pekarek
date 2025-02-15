"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { intl } from "@/lib/i18n"
import type { TableData } from "@/types/table"
import type { ExternalTable } from "@/components/ExternalTableManager"
import type { Prompt } from "@/types/prompt"

interface Project {
  id: string
  name: string
  data: TableData[]
  columns: string[]
  selectedColumn: string | null
  externalTables: ExternalTable[]
  prompts: Prompt[]
}

interface ProjectManagerProps {
  currentProject: Project
  onLoadProject: (project: Project) => void
  onSaveProject: (project: Project) => void
}

export function ProjectManager({ currentProject, onLoadProject, onSaveProject }: ProjectManagerProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const savedProjects = localStorage.getItem("projects")
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("projects", JSON.stringify(projects))
  }, [projects])

  const handleSaveProject = () => {
    if (!currentProject.name) {
      setIsDialogOpen(true)
      return
    }

    const updatedProjects = projects.map((p) => (p.id === currentProject.id ? currentProject : p))
    if (!updatedProjects.some((p) => p.id === currentProject.id)) {
      updatedProjects.push(currentProject)
    }
    setProjects(updatedProjects)
    onSaveProject(currentProject)
    toast({
      title: intl.formatMessage({ id: "app.projectSaved" }),
      description: intl.formatMessage({ id: "app.projectSavedDescription" }, { name: currentProject.name }),
    })
  }

  const handleLoadProject = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    if (project) {
      onLoadProject(project)
      toast({
        title: intl.formatMessage({ id: "app.projectLoaded" }),
        description: intl.formatMessage({ id: "app.projectLoadedDescription" }, { name: project.name }),
      })
    }
  }

  const handleCreateNewProject = () => {
    if (!newProjectName) {
      toast({
        title: intl.formatMessage({ id: "app.error" }),
        description: intl.formatMessage({ id: "app.projectNameRequired" }),
        variant: "destructive",
      })
      return
    }

    const newProject: Project = {
      id: Date.now().toString(),
      name: newProjectName,
      data: [],
      columns: [],
      selectedColumn: null,
      externalTables: [],
      prompts: [],
    }

    setProjects([...projects, newProject])
    onLoadProject(newProject)
    setIsDialogOpen(false)
    setNewProjectName("")
    toast({
      title: intl.formatMessage({ id: "app.projectCreated" }),
      description: intl.formatMessage({ id: "app.projectCreatedDescription" }, { name: newProjectName }),
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{intl.formatMessage({ id: "app.projectManager" })}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Button onClick={handleSaveProject}>{intl.formatMessage({ id: "app.saveProject" })}</Button>
          <Select onValueChange={handleLoadProject}>
            <SelectTrigger>
              <SelectValue placeholder={intl.formatMessage({ id: "app.loadProject" })} />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setIsDialogOpen(true)}>{intl.formatMessage({ id: "app.newProject" })}</Button>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{intl.formatMessage({ id: "app.createNewProject" })}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder={intl.formatMessage({ id: "app.projectName" })}
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button onClick={handleCreateNewProject}>{intl.formatMessage({ id: "app.create" })}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

