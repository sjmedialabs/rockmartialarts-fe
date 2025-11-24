"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Users, BookOpen, Building2, X, Loader2 } from "lucide-react"
import { SearchResult } from "@/lib/searchAPI"

interface SearchResultsProps {
  results: SearchResult[]
  isLoading: boolean
  query: string
  totalResults: number
  onClose: () => void
  onResultClick?: (result: SearchResult) => void
}

const getEntityIcon = (type: string) => {
  switch (type) {
    case 'users':
      return <User className="w-4 h-4" />
    case 'coaches':
      return <Users className="w-4 h-4" />
    case 'courses':
      return <BookOpen className="w-4 h-4" />
    case 'branches':
      return <Building2 className="w-4 h-4" />
    default:
      return <User className="w-4 h-4" />
  }
}

const getEntityColor = (type: string) => {
  switch (type) {
    case 'users':
      return 'bg-blue-100 text-blue-800'
    case 'coaches':
      return 'bg-green-100 text-green-800'
    case 'courses':
      return 'bg-purple-100 text-purple-800'
    case 'branches':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getNavigationPath = (result: SearchResult) => {
  switch (result.type) {
    case 'users':
      // Navigate to student detail page for students
      const role = result.metadata?.role
      if (role === 'student') {
        return `/dashboard/students/${result.id}`
      }
      return `/dashboard/students/${result.id}` // Default to student detail for users
    case 'coaches':
      return `/dashboard/coaches/${result.id}`
    case 'courses':
      return `/dashboard/courses/${result.id}`
    case 'branches':
      return `/dashboard/branches/${result.id}`
    default:
      return '/dashboard'
  }
}

export default function SearchResults({
  results,
  isLoading,
  query,
  totalResults,
  onClose,
  onResultClick
}: SearchResultsProps) {
  const router = useRouter()

  const handleResultClick = (result: SearchResult) => {
    if (onResultClick) {
      onResultClick(result)
    } else {
      // Default navigation behavior
      const path = getNavigationPath(result)
      router.push(path)
      onClose()
    }
  }

  if (isLoading) {
    return (
      <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm text-gray-600">Searching...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!query || query.length < 2) {
    return null
  }

  return (
    <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-lg max-h-96 overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">
              Search Results for "{query}"
            </span>
            {totalResults > 0 && (
              <Badge variant="secondary" className="text-xs">
                {totalResults} results
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <div className="text-sm">No results found for "{query}"</div>
              <div className="text-xs mt-1">
                Try searching for names, IDs, or other identifiers
              </div>
            </div>
          ) : (
            <div className="divide-y">
              {results.map((result, index) => (
                <div
                  key={`${result.type}-${result.id}-${index}`}
                  className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getEntityIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {result.title}
                        </h4>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getEntityColor(result.type)}`}
                        >
                          {result.type}
                        </Badge>
                      </div>
                      {result.subtitle && (
                        <p className="text-xs text-gray-600 mb-1">
                          {result.subtitle}
                        </p>
                      )}
                      {result.description && (
                        <p className="text-xs text-gray-500 truncate">
                          {result.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {results.length > 0 && (
          <div className="p-3 border-t bg-gray-50">
            <div className="text-xs text-gray-500 text-center">
              Press Enter to see all results or click on an item to navigate
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
