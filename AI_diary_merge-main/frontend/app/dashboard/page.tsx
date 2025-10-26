"use client"

import { useGoogleAuth } from "@/hooks/use-google-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Dashboard() {
  // ✅ Google 로그인 훅
  const { user: googleUser, signOut, loading } = useGoogleAuth()
  const router = useRouter()

  // ✅ 이메일 로그인 사용자 로드
  const [emailUser, setEmailUser] = useState<any>(null)
  const [diaries, setDiaries] = useState<any[]>([]) // ✅ 일기 목록 상태 추가

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setEmailUser(JSON.parse(storedUser))
    }
  }, [])

  // ✅ 현재 로그인된 사용자 (Google 또는 Email)
  const currentUser = googleUser || emailUser

  // ✅ 로그인 안 되어 있으면 홈으로 리다이렉트
  useEffect(() => {
    if (!loading && !currentUser) {
      router.push("/")
    }
  }, [loading, currentUser, router])

  // ✅ 사용자별 일기 목록 가져오기
  useEffect(() => {
    const fetchDiaries = async () => {
      try {
        const userId = currentUser?._id
        if (!userId) return

        const response = await fetch(`http://localhost:3001/api/diary/${userId}`)
        if (!response.ok) {
          console.error("❌ 일기 불러오기 실패:", response.status)
          return
        }

        const data = await response.json()
        setDiaries(data)
        console.log("✅ 불러온 일기 목록:", data)
      } catch (err) {
        console.error("❌ 일기 목록 로드 오류:", err)
      }
    }

    if (currentUser?._id) fetchDiaries()
  }, [currentUser])

  // ✅ 로그아웃
  const handleLogout = async () => {
    localStorage.removeItem("user")
    signOut() // Google 로그인일 경우 로그아웃
    router.push("/")
  }

  // ✅ 로딩 중 표시
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // ✅ 유저 정보가 없으면 아무것도 렌더링하지 않음
  if (!currentUser) return null

  // ✅ 유저 프로필 정보 추출
  const displayName =
    currentUser.name || currentUser.username || currentUser.email.split("@")[0]
  const displayEmail = currentUser.email || "No email"
  const avatarSrc = currentUser.picture || "/placeholder.svg"

  // ✅ 대시보드 UI
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* 상단 프로필 및 로그아웃 버튼 */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={avatarSrc} alt={displayName} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">AI Diary Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {decodeURIComponent(displayName)}!
              </p>
              <p className="text-sm text-muted-foreground/80">{displayEmail}</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Sign out
          </Button>
        </div>

        {/* 주요 기능 카드 영역 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* 다이어리 작성 */}
          <Card className="border-border/30 shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Upload Photos</CardTitle>
              <CardDescription>사진 업로드로 일기 생성하기</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm h-11"
                onClick={() => router.push("/diary")}
              >
                Upload Photos
              </Button>
            </CardContent>
          </Card>

          {/* 최근 다이어리 보기 */}
          <Card className="border-border/30 shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Entries</CardTitle>
              <CardDescription>최근 생성된 AI 일기 보기</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full bg-transparent border-border/50 hover:bg-accent/50"
                onClick={() => router.push("/dashboard")}
              >
                View Entries
              </Button>
            </CardContent>
          </Card>

          {/* 설정 */}
          <Card className="border-border/30 shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Settings</CardTitle>
              <CardDescription>AI 일기 설정 변경</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full bg-transparent border-border/50 hover:bg-accent/50"
              >
                Open Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* ✅ 사용자별 일기 목록 표시 */}
        <Card className="mt-10 border-border/30 shadow-md">
          <CardHeader>
            <CardTitle>📔 My Diaries</CardTitle>
            <CardDescription>내가 작성한 AI 일기 목록입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            {diaries.length === 0 ? (
              <p className="text-sm text-muted-foreground">아직 작성된 일기가 없습니다.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {diaries.map((diary) => (
                  <Card key={diary._id} className="border-border/40 shadow-sm hover:shadow-lg transition">
                    <CardHeader>
                      <CardTitle className="text-lg">{diary.title}</CardTitle>
                      <CardDescription>
                        {new Date(diary.createdAt).toLocaleString("ko-KR")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {diary.photos?.length > 0 && (
                        <img
                          src={diary.photos[0]}
                          alt="Diary"
                          className="w-full h-40 object-cover rounded-md mb-3"
                        />
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-3">{diary.content}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {diary.keywords?.map((kw: string) => (
                          <span key={kw} className="text-xs px-2 py-1 bg-accent/50 rounded-md">
                            #{kw}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 디버깅용 유저 정보 */}
        <Card className="mt-8 border-border/30 shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground">User Information</CardTitle>
            <CardDescription>계정 정보 (개발용)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm">
              <span className="font-medium text-foreground">Name:</span>
              <span className="ml-2 text-muted-foreground">{displayName}</span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-foreground">Email:</span>
              <span className="ml-2 text-muted-foreground">{displayEmail}</span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-foreground">User ID:</span>
              <span className="ml-2 text-muted-foreground font-mono">
                {currentUser._id || currentUser.id || "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
